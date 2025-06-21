// Content script that runs on web pages
import Deal from './compontents/deal';
import Goal from './compontents/goal';
import GoalStorage from './compontents/goalStorage';
import Strategy from './compontents/strategy';
import StrategyStorage from './compontents/strategyStorage';
import Toast from './compontents/toast';
import Wizard from './compontents/wizzard';
import { ExtensionMessage, ExtensionResponse, logger } from './utils';

logger.log('Content script initialized');

// CSS styles to be injected into the page
const STYLES = `
  .dw-extension-highlight {
    background-color: rgba(255, 255, 0, 0.3);
    border: 2px solid #ffd700;
    transition: all 0.3s ease-in-out;
  }
  
  .dw-extension-highlight:hover {
    background-color: rgba(255, 215, 0, 0.5);
  }
  
  .dw-extension-tooltip {
    position: absolute;
    background: #333;
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 10000;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .dw-extension-tooltip.visible {
    opacity: 1;
  }

  .wizard-wrapper {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
  }

  .goal-wrapper {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
  }
`;

// Declare window interfaces for our components
declare global {
  interface Window {
    Toast: any;
    StrategyStorage: any;
    GoalStorage: any;
    Strategy: any;
    Deal: any;
    Goal: any;
    Wizard: any;
    CurrentGoal: string;
  }
}

// Example of interacting with the web page
const injectStyles = () => {
  const style = document.createElement('style');
  style.textContent = STYLES;
  document.head.appendChild(style);
};

// Create a tooltip element that follows the mouse on highlighted elements
const createTooltip = () => {
  const tooltip = document.createElement('div');
  tooltip.className = 'dw-extension-tooltip';
  document.body.appendChild(tooltip);

  // Add event listeners to show/hide the tooltip on highlighted elements
  document.addEventListener('mouseover', e => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('dw-extension-highlight')) {
      tooltip.textContent = `${target.tagName.toLowerCase()} - DealWizard highlighted element`;
      tooltip.classList.add('visible');

      // Position the tooltip near the mouse
      document.addEventListener('mousemove', positionTooltip);
    }
  });

  document.addEventListener('mouseout', e => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('dw-extension-highlight')) {
      tooltip.classList.remove('visible');
      document.removeEventListener('mousemove', positionTooltip);
    }
  });

  const positionTooltip = (e: MouseEvent) => {
    tooltip.style.left = `${e.pageX + 10}px`;
    tooltip.style.top = `${e.pageY + 10}px`;
  };
};

// Initialize the modules in the window object
const initializeModules = (): void => {
  try {
    logger.log('Initializing DealWizard modules');

    // Assign imported modules to window object
    window.Toast = Toast;
    window.StrategyStorage = StrategyStorage;
    window.GoalStorage = GoalStorage;
    window.Strategy = Strategy;
    window.Deal = Deal;
    window.Goal = Goal;
    window.Wizard = Wizard;

    logger.log('All DealWizard modules initialized successfully');
    initializeComponents();
  } catch (error) {
    logger.error('Error initializing DealWizard modules:', error);
  }
};

// Initialize UI components
let wizardInitialized = false;

function createWizardWrapper(): HTMLElement {
  logger.log('Creating wizard wrapper');
  const wrapper = document.createElement('div');
  wrapper.className = 'wizard-wrapper';
  document.body.appendChild(wrapper);
  logger.log('Wizard wrapper created');
  return wrapper;
}

function initializeComponents(): void {
  if (!document.body) {
    logger.log('Document body not ready, waiting...');
    return;
  }

  logger.log('Attempting to initialize DealWizard components');

  if (wizardInitialized) {
    logger.log('Components already initialized, skipping');
    return;
  }

  try {
    if (!window.Wizard) {
      throw new Error('Wizard module not loaded');
    }

    // Create wrapper first
    const wrapper = createWizardWrapper();

    logger.log('Creating new Wizard instance');
    new window.Wizard();
    logger.log('Wizard initialized successfully');
    wizardInitialized = true;

    // Add click handler to wizard icon
    const wizardIcon = document.querySelector('#rm-hover-icon');
    if (wizardIcon) {
      logger.log('Adding click handler to wizard icon');
      wizardIcon.addEventListener('click', () => {
        logger.log('Wizard icon click detected');
        handleWizardClick();
      });
    } else {
      logger.error('Could not find wizard icon element');
    }

    // After Wizard is initialized, create the Goal component
    if (window.Goal) {
      logger.log('Creating Goal component');
      const goalContainer = document.createElement('div');
      goalContainer.className = 'goal-wrapper';
      document.body.appendChild(goalContainer);
      new window.Goal(goalContainer);
      logger.log('Goal component created');
    }
  } catch (error) {
    logger.error('Error initializing components:', error);
  }
}

// Initialize currentGoal variable
let currentGoal = '';

// Add event listener for goal data
function setupEventListeners(): void {
  document.addEventListener('wizardClickWithGoal', ((event: CustomEvent) => {
    logger.log('Received goal data:', event.detail);
    if (event.detail && event.detail.goal) {
      currentGoal = event.detail.goal;
      window.CurrentGoal = currentGoal;
    }
  }) as EventListener);
}

function handleWizardClick(): void {
  logger.log('Wizard icon clicked');
  // No need to send webhook here as it's handled in Wizard.js
}

// Example functionality that can be triggered from popup
const performAction = (): ExtensionResponse => {
  logger.log('Performing action on the current page');

  try {
    // Example: highlighting some elements on the page
    const headings = document.querySelectorAll('h1, h2');
    let count = 0;

    headings.forEach(heading => {
      heading.classList.toggle('dw-extension-highlight');
      if (heading.classList.contains('dw-extension-highlight')) {
        count++;
      }
    });

    return { success: true, data: { count, state: count > 0 ? 'added' : 'removed' } };
  } catch (error) {
    logger.error('Error performing action:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Initialize content features
const initialize = () => {
  injectStyles();
  createTooltip();
  setupEventListeners();

  // Initialize modules instead of dynamically loading them
  initializeModules();

  // Try initializing components when the DOM is ready
  if (document.readyState === 'loading') {
    logger.log('Document still loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', () => {
      logger.log('DOMContentLoaded triggered');
      initializeComponents();
    });
  } else {
    logger.log('Document already loaded, initializing immediately');
    initializeComponents();
  }

  // Also try on load event as a fallback
  window.addEventListener('load', () => {
    logger.log('Window load triggered');
    if (!wizardInitialized) {
      initializeComponents();
    }
  });

  // Listen for messages from popup or background script
  chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage, sender, sendResponse: (response: ExtensionResponse) => void) => {
      logger.log('Content script received message:', message);

      switch (message.action) {
        case 'performAction':
          const result = performAction();
          sendResponse(result);
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }

      return true; // Keep the message channel open for asynchronous response
    }
  );

  logger.log('Content script fully initialized');
};

// Start the initialization process
initialize();
