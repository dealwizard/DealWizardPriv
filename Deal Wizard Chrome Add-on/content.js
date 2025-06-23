// Load all modules in sequence
const loadAllModules = async () => {
  let logger;
  try {
    // Import modules in the correct order
    const { default: loggerFactory, LogLevel } = await import(chrome.runtime.getURL('tools/logger.js'));
    const { LOG_LEVEL, VERSION } = await import(chrome.runtime.getURL('constants.js'));

    // Set TRACE level for all components
    loggerFactory.setDefaultLevel(LogLevel.TRACE);

    // Get content logger
    logger = loggerFactory.getLogger('DEAL-WIZARD/CONTENT');
    logger.info(`Deal Wizard ${VERSION} initialized`);
    logger.trace('Logger initialized with TRACE level');
    
    logger.trace('Setting up component logging levels');
    logger.trace('All components set to TRACE level by default');

    // Load modules in sequence with proper error handling
    try {
      const { default: Toast } = await import(chrome.runtime.getURL('components/Toast.js'));
      window.Toast = Toast;
      logger.trace('Toast module imported');
    } catch (e) {
      logger.error('Failed to load Toast module:', e);
    }

    try {
      const { default: StrategyStorage } = await import(chrome.runtime.getURL('components/strategyStorage.js'));
      window.StrategyStorage = StrategyStorage;
      logger.trace('StrategyStorage module imported');
    } catch (e) {
      logger.error('Failed to load StrategyStorage module:', e);
    }

    try {
      const { default: GoalStorage } = await import(chrome.runtime.getURL('components/goalStorage.js'));
      window.GoalStorage = GoalStorage;
      logger.trace('GoalStorage module imported');
    } catch (e) {
      logger.error('Failed to load GoalStorage module:', e);
    }

    try {
      const { default: Strategy } = await import(chrome.runtime.getURL('components/Strategy.js'));
      window.Strategy = Strategy;
      logger.trace('Strategy module imported');
    } catch (e) {
      logger.error('Failed to load Strategy module:', e);
    }

    try {
      const { default: Deal } = await import(chrome.runtime.getURL('components/Deal.js'));
      window.Deal = Deal;
      logger.trace('Deal module imported');
    } catch (e) {
      logger.error('Failed to load Deal module:', e);
    }

    try {
      const { default: Goal } = await import(chrome.runtime.getURL('components/goal.js'));
      window.Goal = Goal;
      logger.trace('Goal module imported');
    } catch (e) {
      logger.error('Failed to load Goal module:', e);
    }

    try {
      const { default: Wizard } = await import(chrome.runtime.getURL('components/Wizard.js'));
      window.Wizard = Wizard;
      logger.trace('Wizard module imported');
    } catch (e) {
      logger.error('Failed to load Wizard module:', e);
    }

    let wizardInitialized = false;

    function createWizardWrapper() {
      logger.trace('Creating wizard wrapper');
      const wrapper = document.createElement('div');
      wrapper.className = 'wizard-wrapper';
      document.body.appendChild(wrapper);
      logger.trace('Wizard wrapper created');
      return wrapper;
    }

    function initializeWizard() {
      if (!document.body) {
        logger.trace('Document body not ready, waiting...');
        return;
      }

      logger.trace('Attempting to initialize Wizard');
      
      if (wizardInitialized) {
        logger.trace('Wizard already initialized, skipping');
        return;
      }

      try {
        if (!window.Wizard) {
          throw new Error('Wizard module not loaded');
        }

        // Create wrapper first
        const wrapper = createWizardWrapper();
        
        logger.trace('Creating new Wizard instance');
        new window.Wizard();
        logger.trace('Wizard initialized successfully');
        wizardInitialized = true;

        // Add click handler to wizard icon
        const wizardIcon = document.querySelector('#rm-hover-icon');
        if (wizardIcon) {
          logger.trace('Adding click handler to wizard icon');
          wizardIcon.addEventListener('click', () => {
            logger.info('[DEAL-WIZARD][COMMUNICATION] Wizard icon click detected');
            handleWizardClick();
          });
        } else {
          logger.error('[DEAL-WIZARD][COMMUNICATION] Could not find wizard icon element');
        }

        // After Wizard is initialized, create the Goal component
        if (window.Goal) {
          logger.trace('Creating Goal component');
          const goalContainer = document.createElement('div');
          goalContainer.className = 'goal-wrapper';
          document.body.appendChild(goalContainer);
          new window.Goal(goalContainer);
          logger.trace('Goal component created');
        }
      } catch (error) {
        logger.error('Error initializing components:', error);
        logger.trace('Error details:', {
          error,
          wizardAvailable: !!window.Wizard,
          goalAvailable: !!window.Goal,
          documentState: {
            hasBody: !!document.body,
            readyState: document.readyState
          }
        });
      }
    }

    // Initialize currentGoal variable
    let currentGoal = '';

    // Add event listener for goal data
    document.addEventListener('wizardClickWithGoal', (event) => {
      logger.info('[DEAL-WIZARD][COMMUNICATION] Received goal data:', event.detail);
      if (event.detail && event.detail.goal) {
        currentGoal = event.detail.goal;
        window.currentGoal = currentGoal;
      }
    });

    function handleWizardClick() {
      logger.info('[DEAL-WIZARD][COMMUNICATION] Wizard icon clicked');
      // No need to send webhook here as it's handled in Wizard.js
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      logger.trace('Document still loading, waiting for DOMContentLoaded');
      document.addEventListener('DOMContentLoaded', () => {
        logger.trace('DOMContentLoaded triggered');
        initializeWizard();
      });
    } else {
      logger.trace('Document already loaded, initializing immediately');
      initializeWizard();
    }

    // Also try on load event as a fallback
    window.addEventListener('load', () => {
      logger.trace('Window load triggered');
      if (!wizardInitialized) {
        initializeWizard();
      }
    });

    logger.trace('All modules loaded successfully');

  } catch (error) {
    if (logger) {
      logger.error('Error loading modules:', error);
      logger.trace('Error details:', error);
    } else {
      console.error('[DEAL-WIZARD] Error loading modules:', error);
    }
  }
};

// Start loading modules
loadAllModules();
