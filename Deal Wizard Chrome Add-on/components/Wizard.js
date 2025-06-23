import LoggerFactory from '../tools/logger.js';
import Toast from './Toast.js';
import Strategy from './Strategy.js';
import Deal from './Deal.js';
import AnalysisChecker from '../tools/analysisChecker.js';
import { DEAL_WIZARD_BASE_URL, LOG_LEVEL } from '../constants.js';

const logger = LoggerFactory.getLogger('DEAL-WIZARD/WIZARD', LOG_LEVEL);
logger.info('Wizard.js loaded');

class Wizard {
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
  initializeUI() {
    logger.info('Initializing UI elements');
    const wrapper = this.createWrapper();
    this.createIcon(wrapper);
    this.initializeStrategy(wrapper);
    this.setupEventListeners(wrapper);
  }

  /**
   * Create the main wrapper element
   */
  createWrapper() {
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
  createIcon(wrapper) {
    this.icon = document.createElement("img");
    this.icon.src = chrome.runtime.getURL("Assets/Icon.png");
    this.icon.id = "rm-hover-icon";
    this.icon.title = "Select strategy and click to analyze this property";
    this.icon.classList.add("wizard-intro");
    
    // Style the icon
    this.icon.style.width = "120px";
    this.icon.style.height = "120px";
    this.icon.style.cursor = "pointer";
    this.icon.style.display = "block";

    wrapper.appendChild(this.icon);
    logger.info('Icon created and added to wrapper');
  }

  /**
   * Initialize the strategy component
   */
  initializeStrategy(wrapper) {
    logger.info('Initializing Strategy component');
    this.strategy = new Strategy(wrapper, (selectedStrategy) => {
      this.handleStrategySelect(selectedStrategy);
    });
  }

  /**
   * Set up event listeners for the UI elements
   */
  setupEventListeners(wrapper) {
    // Icon click handler
    this.icon.addEventListener("click", () => this.handleFirstClick());

    // Animation end handler
    this.icon.addEventListener("animationend", () => {
      this.icon.classList.remove("wizard-intro");
    }, { once: true });

    // Hover tracking
    wrapper.addEventListener('mouseenter', () => {
      logger.info('Mouse entered wizard wrapper');
    });

    wrapper.addEventListener('mouseleave', () => {
      logger.info('Mouse left wizard wrapper');
    });
  }

  /**
   * Handle strategy selection
   */
  handleStrategySelect(strategy) {
    if (strategy) {
      logger.info(`Strategy selected: ${strategy}`);
      this.selectedStrategy = strategy;
      this.icon.title = `Analyze this property using ${strategy.toUpperCase()} strategy`;
    } else {
      logger.info('No strategy selected');
      new Toast("Please select a strategy (FLIP, BTL, or HMO) first").show();
    }
  }

  /**
   * Handle the first click on the wizard icon
   */
  async handleFirstClick() {
    if (!this.selectedStrategy) {
      logger.info('No strategy selected');
      new Toast("Please select a strategy (FLIP, BTL, or HMO) first").show();
      return;
    }

    // Get current goal value from custom event and wait for response
    return new Promise((resolve) => {
      const goalEvent = new CustomEvent('getGoalValue', {
        bubbles: true,
        detail: { requestId: Date.now() }
      });
      
      // Wait for goal value to be set
      const checkGoal = () => {
        if (window.currentGoal !== undefined) {
          const goal = window.currentGoal || '';
          
          // Hide unselected strategy options
          document.querySelectorAll('.strategy-option').forEach(btn => {
            if (btn.textContent.toLowerCase() !== this.selectedStrategy) {
              btn.classList.add('hidden');
            }
          });

          logger.info(`Processing with strategy: ${this.selectedStrategy}`);

          // Play blink sound and start pulsing animation before sending webhook request
          const sound = new Audio(chrome.runtime.getURL("Assets/blink.mp3"));
          sound.play().catch(err => logger.error("Sound playback failed:", err));
          this.icon.classList.add("pulsing");
          new Toast("I'm working on the deal... Give me about two minutes...").show();

          // First encode the URL separately to handle special characters
          const encodedUrl = encodeURIComponent(window.location.href);
          
          // Construct webhook URL with query parameters
          const webhookUrl = `https://dealwizard.app.n8n.cloud/webhook/ffdd965e-5f7e-4ff2-af4d-a68c3d4546c9?url=${encodedUrl}&strategy=${encodeURIComponent(this.selectedStrategy)}&goal=${encodeURIComponent(goal)}&timestamp=${encodeURIComponent(new Date().toISOString())}`;

          logger.info('[DEAL-WIZARD][COMMUNICATION] Sending data to webhook:', {
            endpoint: webhookUrl
          });

          // Send GET request to webhook
          fetch(webhookUrl, {
            method: 'GET'
          })
          .then(async response => {
            logger.info('[DEAL-WIZARD][COMMUNICATION] Received response status:', response.status);
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
              return JSON.parse(text);
            } catch (e) {
              throw new Error(`Invalid JSON response from ${webhookUrl}. Response: ${text.substring(0, 100)}...`);
            }
          })
          .then(responseData => {
            logger.info('[DEAL-WIZARD][COMMUNICATION] Webhook response data:', responseData);
            if (!responseData || !responseData.unique_id) {
              throw new Error(`Response missing unique_id from ${webhookUrl}`);
            }
            // Extract unique_id from response data
            let uniqueId = responseData.unique_id;
            this.startAnalysis(uniqueId);
            resolve();
          })
          .catch(error => {
            logger.error('[DEAL-WIZARD][COMMUNICATION] Webhook error:', {
              error: error.message,
              stack: error.stack,
              webhookUrl: webhookUrl
            });
            new Toast("Failed to start analysis. Please try again.").show();
            this.icon.classList.remove("pulsing");
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
  startAnalysis(uniqueId) {
    // Construct the destination URL with the unique ID
    const destinationUrl = `${DEAL_WIZARD_BASE_URL}/${uniqueId}`;
    
    // Start polling for analysis status
    if (uniqueId) {
      this.analysisChecker.startPolling(
        uniqueId,
        (status) => {
          // On success
          logger.info('Analysis completed successfully', status);
          this.transformToDeal(status);
        },
        (error) => {
          // On error
          logger.error('Analysis failed', error);
          new Toast("Analysis failed. Please try again.").show();
          this.icon.classList.remove("pulsing");
        }
      );
    } else {
      logger.error('No uniqueId provided for analysis');
      new Toast("Analysis failed. Please try again.").show();
      this.icon.classList.remove("pulsing");
    }
  }

  /**
   * Transform to deal view after analysis
   */
  transformToDeal(response) {
    this.icon.classList.remove("pulsing");
    this.icon.classList.add("rm-transition-out");

    logger.debug('Transforming to deal with response:', response);

    // Create the Deal instance immediately
    const deal = new Deal(this.icon, { uniqueId: response._id || response.unique_id });
    
    // Handle the icon animation separately
    this.icon.addEventListener("animationend", () => {
      deal.initialize();
    }, { once: true });
  }
}

export { Wizard as default };
logger.info('Wizard class exported:', true); 