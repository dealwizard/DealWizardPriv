import { DealResponse, WebhookResponseData } from '../types';
import AnalysisChecker from '../utils/analysisChecker';
import LoggerFactory, { Logger } from '../utils/logger';
import Deal from './deal';
import Strategy from './strategy';
import Toast from './toast';

const logger: Logger = LoggerFactory.getLogger('DEAL-WIZARD/WIZARD');
logger.info('Wizard.js loaded');

class Wizard {
  private icon: HTMLImageElement | null;
  private destinationUrl: string | null;
  private selectedStrategy: string | null;
  private strategy: Strategy | null;
  private analysisChecker: AnalysisChecker;

  constructor() {
    logger.info('Wizard constructor called');

    // Initialize properties
    this.icon = null;
    this.destinationUrl = null;
    this.selectedStrategy = null;
    this.strategy = null;
    this.analysisChecker = new AnalysisChecker();

    // Create UI elements
    this.initializeUI();
  }

  /**
   * Initialize all UI elements
   */
  private initializeUI(): void {
    logger.info('Initializing UI elements');
    const wrapper = this.createWrapper();
    this.createIcon(wrapper);
    this.initializeStrategy(wrapper);
    this.setupEventListeners(wrapper);
  }

  /**
   * Create the main wrapper element
   */
  private createWrapper(): HTMLDivElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'wizard-icon-wrapper';
    wrapper.style.position = 'fixed';
    wrapper.style.bottom = '150px';
    wrapper.style.right = '150px';
    wrapper.style.zIndex = '10000';

    document.body.appendChild(wrapper);
    logger.info('Wrapper created and added to document');
    return wrapper;
  }

  /**
   * Create the wizard icon
   */
  private createIcon(wrapper: HTMLDivElement): void {
    this.icon = document.createElement('img');
    this.icon.src = chrome.runtime.getURL('assets/icon.png');
    this.icon.id = 'rm-hover-icon';
    this.icon.title = 'Select strategy and click to analyze this property';
    this.icon.classList.add('wizard-intro');

    // Style the icon
    this.icon.style.width = '120px';
    this.icon.style.height = '120px';
    this.icon.style.cursor = 'pointer';
    this.icon.style.display = 'block';

    wrapper.appendChild(this.icon);
    logger.info('Icon created and added to wrapper');
  }

  /**
   * Initialize the strategy component
   */
  private initializeStrategy(wrapper: HTMLDivElement): void {
    logger.info('Initializing Strategy component');
    this.strategy = new Strategy(wrapper, (selectedStrategy: string | undefined) => {
      this.handleStrategySelect(selectedStrategy || '');
    });
  }

  /**
   * Set up event listeners for the UI elements
   */
  private setupEventListeners(wrapper: HTMLDivElement): void {
    if (!this.icon) return;

    // Icon click handler
    this.icon.addEventListener('click', () => this.handleFirstClick());

    // Animation end handler
    this.icon.addEventListener(
      'animationend',
      () => {
        if (this.icon) this.icon.classList.remove('wizard-intro');
      },
      { once: true }
    );

    // Hover tracking
    // wrapper.addEventListener('mouseenter', () => {
    //   logger.info('Mouse entered wizard wrapper');
    // });

    // wrapper.addEventListener('mouseleave', () => {
    //   logger.info('Mouse left wizard wrapper');
    // });
  }

  /**
   * Handle strategy selection
   */
  private handleStrategySelect(strategy: string): void {
    if (strategy) {
      logger.info(`Strategy selected: ${strategy}`);
      this.selectedStrategy = strategy;
      if (this.icon) {
        this.icon.title = `Analyze this property using ${strategy.toUpperCase()} strategy`;
      }
    } else {
      logger.info('No strategy selected');
      new Toast('Please select a strategy (FLIP, BTL, or HMO) first').show();
    }
  }

  /**
   * Handle the first click on the wizard icon
   */
  private async handleFirstClick(): Promise<void> {
    if (!this.selectedStrategy) {
      logger.info('No strategy selected');
      new Toast('Please select a strategy (FLIP, BTL, or HMO) first').show();
      return;
    }

    // Get current goal value from custom event and wait for response
    return new Promise<void>(resolve => {
      const goalEvent = new CustomEvent('getGoalValue', {
        bubbles: true,
        detail: { requestId: Date.now() },
      });

      // Wait for goal value to be set
      const checkGoal = (): void => {
        if (window.CurrentGoal !== undefined) {
          const goal = window.CurrentGoal || '';

          // Hide unselected strategy options
          document.querySelectorAll('.strategy-option').forEach(btn => {
            if ((btn as HTMLElement).textContent?.toLowerCase() !== this.selectedStrategy) {
              btn.classList.add('hidden');
            }
          });

          logger.info(`Processing with strategy: ${this.selectedStrategy}`);

          // Play blink sound and start pulsing animation before sending webhook request
          const sound = new Audio(chrome.runtime.getURL('assets/blink.mp3'));
          sound.play().catch(err => logger.error('Sound playback failed:', err));

          if (this.icon) {
            this.icon.classList.add('pulsing');
          }

          new Toast("I'm working on the deal... Give me about two minutes...").show();

          // First encode the URL separately to handle special characters
          const encodedUrl = encodeURIComponent(window.location.href);

          // Construct webhook URL with query parameters
          const webhookUrl = `https://dealwizard.app.n8n.cloud/webhook/ffe87ebe-495e-43b8-859b-b9bacccb9519?url=${encodedUrl}&strategy=${encodeURIComponent(this.selectedStrategy as string)}&goal=${encodeURIComponent(goal)}&timestamp=${encodeURIComponent(new Date().toISOString())}`;

          logger.info('[DEAL-WIZARD][COMMUNICATION] Sending data to webhook:', {
            endpoint: webhookUrl,
          });

          // Send GET request to webhook
          fetch(webhookUrl, {
            method: 'GET',
          })
            .then(async response => {
              logger.info(
                '[DEAL-WIZARD][COMMUNICATION] Received response status:',
                response.status
              );
              logger.info('[DEAL-WIZARD][COMMUNICATION] Webhook URL:', webhookUrl);

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              // Get the raw text first
              const text = await response.text();
              logger.info('[DEAL-WIZARD][COMMUNICATION] Raw response:', text);
              logger.info('[DEAL-WIZARD][COMMUNICATION] Response length:', text.length);

              // Try to parse as JSON if we have content
              if (!text) {
                throw new Error(`Empty response received from ${webhookUrl}`);
              }

              try {
                return JSON.parse(text) as WebhookResponseData;
              } catch (e) {
                throw new Error(
                  `Invalid JSON response from ${webhookUrl}. Response: ${text.substring(0, 100)}...`
                );
              }
            })
            .then((responseData: WebhookResponseData) => {
              logger.info('[DEAL-WIZARD][COMMUNICATION] Webhook response data:', responseData);
              if (!responseData || !responseData.unique_id) {
                throw new Error(`Response missing unique_id from ${webhookUrl}`);
              }
              // Extract unique_id from response data
              let uniqueId = responseData.unique_id;
              this.startAnalysis(uniqueId);
              resolve();
            })
            .catch((error: Error) => {
              logger.error('[DEAL-WIZARD][COMMUNICATION] Webhook error:', {
                error: error.message,
                stack: error.stack,
                webhookUrl: webhookUrl,
              });
              new Toast('Failed to start analysis. Please try again.').show();
              if (this.icon) {
                this.icon.classList.remove('pulsing');
              }
              resolve();
            });
        } else {
          // Check again in 100ms if goal value isn't set yet
          setTimeout(checkGoal, 100);
        }
      };

      // Dispatch event and start checking for goal value
      document.dispatchEvent(goalEvent);
      checkGoal();
    });
  }

  /**
   * Start the property analysis process
   */
  private startAnalysis(uniqueId: string): void {
    // Construct the destination URL with the unique ID
    //const destinationUrl = `https://deal-wizard-home-61532.bubbleapps.io/new_product_page/${uniqueId}`;
    const destinationUrl = `https://deal-wizard-home-61532.bubbleapps.io/version-test/new_product_page/${uniqueId}`

    // Start polling for analysis status
    if (uniqueId) {
      this.analysisChecker.startPolling(
        uniqueId,
        (status: any) => {
          // On success
          logger.info('Analysis completed successfully', status);
          this.transformToDeal(status);
        },
        (error: Error | string) => {
          // On error
          logger.error('Analysis failed', error);
          new Toast('Analysis failed. Please try again.').show();
          if (this.icon) {
            this.icon.classList.remove('pulsing');
          }
        }
      );
    } else {
      logger.error('No uniqueId provided for analysis');
      new Toast('Analysis failed. Please try again.').show();
      if (this.icon) {
        this.icon.classList.remove('pulsing');
      }
    }
  }

  /**
   * Transform to deal view after analysis
   */
  private transformToDeal(response: DealResponse): void {
    if (!this.icon) return;

    this.icon.classList.remove('pulsing');
    this.icon.classList.add('rm-transition-out');

    logger.debug('Transforming to deal with response:', response);

    this.icon.addEventListener(
      'animationend',
      () => {
        if (!this.icon) return;

        // Use the full unique ID from the response
        const deal = new Deal(this.icon, { uniqueId: response._id || response.unique_id });
        deal.initialize();

        // Wait for the deal icon to be fully initialized before opening the tab
        setTimeout(() => {
          // Only open the tab if the deal icon is available and visible
          const dealIcon = document.querySelector('#rm-hover-icon:not(.rm-transition-out)');
          if (dealIcon && deal.destinationUrl) {
            logger.info('Deal icon is ready, opening deal URL:', deal.destinationUrl);
            chrome.runtime.sendMessage(
              {
                action: 'analyze', // Updated from type to action
                strategy: this.selectedStrategy || '',
                destinationUrl: deal.destinationUrl,
              },
              (response: { success: boolean; data?: { tabId: number }; error?: string }) => {
                if (response?.success && response.data?.tabId) {
                  deal.setCreatedTabId(response.data.tabId);
                  logger.info(
                    '[DEAL-WIZARD][NAVIGATION] Background tab opened after deal icon ready:',
                    {
                      destinationUrl: deal.destinationUrl,
                      tabId: response.data.tabId,
                    }
                  );
                }
              }
            );
          } else {
            logger.info('Deal icon not ready or no destination URL available');
          }
        }, 500); // Give enough time for the deal icon to be fully initialized
      },
      { once: true }
    );
  }
}

export default Wizard;
logger.info('Wizard class exported:', true);
