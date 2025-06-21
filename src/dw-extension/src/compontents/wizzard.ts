import LoggerFactory from '../utils/logger';
import Toast from './toast';
import Strategy from './strategy';
import Deal from './deal';

const logger = LoggerFactory.getLogger('DEAL-WIZARD/WIZARD');
logger.info('Wizard loaded');

// Declare global window property for currentGoal
declare global {
  interface Window {
    currentGoal?: string;
  }
}

interface WebhookResponse {
  destinationUrl?: string;
  [key: number]: { destinationUrl?: string };
}

class Wizard {
  private icon: HTMLImageElement | null;
  private destinationUrl: string | null;
  private selectedStrategy: string | null;
  private strategy: Strategy | null;

  constructor() {
    logger.info('Wizard constructor called');
    
    // Initialize properties
    this.icon = null;
    this.destinationUrl = null;
    this.selectedStrategy = null;
    this.strategy = null;
    
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
    wrapper.style.position = "fixed";
    wrapper.style.bottom = "150px";
    wrapper.style.right = "150px";
    wrapper.style.zIndex = "10000";
    
    document.body.appendChild(wrapper);
    logger.info('Wrapper created and added to document');
    return wrapper;
  }

  /**
   * Create the wizard icon
   */
  private createIcon(wrapper: HTMLDivElement): void {
    this.icon = document.createElement("img");
    this.icon.src = chrome.runtime.getURL("assets/icon.png");
    this.icon.id = "rm-hover-icon";
    this.icon.title = "Select strategy and click to analyze this property";
    this.icon.classList.add("wizard-intro");
    
    // // Style the icon
    // this.icon.style.width = "120px";
    // this.icon.style.height = "120px";
    // this.icon.style.cursor = "pointer";
    // this.icon.style.display = "block";

    wrapper.appendChild(this.icon);
    logger.info('Icon created and added to wrapper');
  }

  /**
   * Initialize the strategy component
   */
  private initializeStrategy(wrapper: HTMLDivElement): void {
    logger.info('Initializing Strategy component');
    this.strategy = new Strategy(wrapper, (selectedStrategy: string | undefined) => {
      this.handleStrategySelect(selectedStrategy);
    });
  }

  /**
   * Set up event listeners for the UI elements
   */
  private setupEventListeners(wrapper: HTMLDivElement): void {
    // Icon click handler
    if (this.icon) {
      this.icon.addEventListener("click", () => this.handleFirstClick());

      // Animation end handler
      this.icon.addEventListener("animationend", () => {
        this.icon?.classList.remove("wizard-intro");
      }, { once: true });
    }

    // // Hover tracking
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
  private handleStrategySelect(strategy: string | undefined): void {
    if (strategy) {
      logger.info(`Strategy selected: ${strategy}`);
      this.selectedStrategy = strategy;
      if (this.icon) {
        this.icon.title = `Analyze this property using ${strategy.toUpperCase()} strategy`;
      }
    } else {
      logger.info('No strategy selected');
      new Toast("Please select a strategy (FLIP, BTL, or HMO) first").show();
    }
  }

  /**
   * Handle the first click on the wizard icon
   */
  private async handleFirstClick(): Promise<void> {
    if (!this.selectedStrategy) {
      logger.info('No strategy selected');
      new Toast("Please select a strategy (FLIP, BTL, or HMO) first").show();
      return;
    }

    // Get current goal value from custom event and wait for response
    return new Promise<void>((resolve) => {
      const goalEvent = new CustomEvent('getGoalValue', {
        bubbles: true,
        detail: { requestId: Date.now() }
      });
      
      // Wait for goal value to be set
      const checkGoal = (): void => {
        if (window.currentGoal !== undefined) {
          const goal = window.currentGoal || '';
          
          // Hide unselected strategy options
          document.querySelectorAll('.strategy-option').forEach((btn: Element) => {
            if ((btn.textContent?.toLowerCase() !== this.selectedStrategy?.toLowerCase())) {
              btn.classList.add('hidden');
            }
          });

          logger.info(`Processing with strategy: ${this.selectedStrategy}`);

          // Play blink sound and start pulsing animation before sending webhook request
          const sound = new Audio(chrome.runtime.getURL("assets/blink.mp3"));
          sound.play().catch(err => logger.error("Sound playback failed:", err));
          
          if (this.icon) {
            this.icon.classList.add("pulsing");
          }
          
          new Toast("I'm working on the deal... Give me about two minutes...").show();

          // First encode the URL separately to handle special characters
          const encodedUrl = encodeURIComponent(window.location.href);
          
          // Construct webhook URL with query parameters
          const webhookUrl = `https://dealwizard.app.n8n.cloud/webhook/ffdd965e-5f7e-4ff2-af4d-a68c3d4546c9?url=${encodedUrl}&strategy=${encodeURIComponent(this.selectedStrategy || '')}&goal=${encodeURIComponent(goal)}&timestamp=${encodeURIComponent(new Date().toISOString())}`;

          logger.info('[DEAL-WIZARD][COMMUNICATION] Sending data to webhook:', {
            endpoint: webhookUrl
          });

          // Send GET request to webhook
          fetch(webhookUrl, {
            method: 'GET'
          })
          .then(response => {
            logger.info('[DEAL-WIZARD][COMMUNICATION] Received response status:', response.status);
            return response.json();
          })
          .then((responseData: WebhookResponse) => {
            logger.info('[DEAL-WIZARD][COMMUNICATION] Webhook response data:', responseData);
            // Extract destination URL from response data
            let destinationUrl = responseData.destinationUrl || responseData[0]?.destinationUrl;
            this.startAnalysis(destinationUrl);
            resolve();
          })
          .catch(error => {
            logger.error('[DEAL-WIZARD][COMMUNICATION] Webhook error:', {
              error: error.message,
              stack: error.stack
            });
            // Continue with analysis even if webhook fails
            this.startAnalysis(null);
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
  private startAnalysis(destinationUrl: string | null | undefined): void {
    chrome.runtime.sendMessage({ 
      action: "analyze", 
      strategy: this.selectedStrategy,
      destinationUrl: destinationUrl
    }, (response) => {
      this.transformToDeal(response);
    });
  }

  /**
   * Transform to deal view after analysis
   */
  private transformToDeal(response: any): void {
    if (this.icon) {
      this.icon.classList.remove("pulsing");
      this.icon.classList.add("rm-transition-out");

      this.icon.addEventListener("animationend", () => {
        if (this.icon) {
          const deal = new Deal(this.icon, response);
          deal.initialize();
        }
      }, { once: true });
    }
  }
}

export default Wizard;
logger.info('Wizard class exported:', true);