// Content script that runs on web pages
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
`;

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
  document.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('dw-extension-highlight')) {
      tooltip.textContent = `${target.tagName.toLowerCase()} - DealWizard highlighted element`;
      tooltip.classList.add('visible');
      
      // Position the tooltip near the mouse
      document.addEventListener('mousemove', positionTooltip);
    }
  });
  
  document.addEventListener('mouseout', (e) => {
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
  
  // Listen for messages from popup or background script
  chrome.runtime.onMessage.addListener((
    message: ExtensionMessage, 
    sender, 
    sendResponse: (response: ExtensionResponse) => void
  ) => {
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
  });
  
  logger.log('Content script fully initialized');
};

// Start the initialization process
initialize();
