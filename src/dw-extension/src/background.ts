// Background script (Service Worker in Manifest V3)
import { StorageKeys, ExtensionMessage, ExtensionResponse, ExtensionSettings, logger } from './utils';

logger.log('Background script initialized');

// Default settings for the extension
const DEFAULT_SETTINGS: ExtensionSettings = {
  theme: 'light',
  notifications: true,
  features: {
    highlightContent: true,
    showAnalytics: false
  }
};

// Define additional message types
interface AnalyzeMessage extends ExtensionMessage {
  action: 'analyze';
  strategy: string;
  destinationUrl: string;
}

interface FocusTabMessage extends ExtensionMessage {
  action: 'focusTab';
  tabId: number;
}

// Example of using the chrome API
chrome.runtime.onInstalled.addListener(() => {
  logger.log('Extension installed');
  
  // Set default values
  chrome.storage.local.set({ 
    [StorageKeys.ENABLED]: true,
    [StorageKeys.SETTINGS]: DEFAULT_SETTINGS,
    [StorageKeys.USER_DATA]: {
      lastUsed: new Date().toISOString()
    }
  });
});

// Example of handling messages from content script or popup
chrome.runtime.onMessage.addListener((
  message: ExtensionMessage, 
  sender, 
  sendResponse: (response: ExtensionResponse) => void
) => {
  logger.log('Received message:', message);
  
  switch (message.action) {
    case 'getData':
      // Example of sending response back
      sendResponse({ success: true, data: 'Here is the data you requested' });
      break;
      
    case 'getSettings':
      chrome.storage.local.get(StorageKeys.SETTINGS, (result) => {
        sendResponse({ 
          success: true, 
          data: result[StorageKeys.SETTINGS] || DEFAULT_SETTINGS 
        });
      });
      break;
      
    case 'updateSettings':
      if (message.payload) {
        chrome.storage.local.set({ 
          [StorageKeys.SETTINGS]: { 
            ...DEFAULT_SETTINGS, 
            ...message.payload 
          } 
        }, () => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, error: 'No settings provided' });
      }
      break;
    
    case 'analyze':
      handleAnalyzeMessage(message as AnalyzeMessage, sendResponse);
      return true; // Keep the message channel open for async response
      
    case 'focusTab':
      handleFocusTabMessage(message as FocusTabMessage);
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return true; // Keep the message channel open for asynchronous response
});

/**
 * Handles analyze message
 * Creates a tab with the destination URL in the background
 */
async function handleAnalyzeMessage(message: AnalyzeMessage, sendResponse: (response: ExtensionResponse) => void): Promise<void> {
  logger.log('Handling analyze message with strategy:', message.strategy);
  
  try {
    let createdTabId = null;
    let destinationUrl = message.destinationUrl;

    if (destinationUrl) {
      // Add https:// prefix if missing
      if (!destinationUrl.startsWith("http")) {
        destinationUrl = "https://" + destinationUrl;
      }
      const createdTab = await chrome.tabs.create({ url: destinationUrl, active: false });
      createdTabId = createdTab.id;
      logger.log("Deal tab opened in background:", destinationUrl);
    }
    
    sendResponse({ 
      success: true,
      data: {
        destinationUrl, 
        tabId: createdTabId
      }
    });
  } catch (err) {
    logger.error("Error handling analyze message:", err);
    sendResponse({ 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error" 
    });
  }
}

/**
 * Handles focusTab message
 * Brings the specified tab to focus
 */
function handleFocusTabMessage(message: FocusTabMessage): void {
  logger.log('Focusing tab:', message.tabId);
  chrome.tabs.update(message.tabId, { active: true })
    .catch(err => logger.error('Error focusing tab:', err));
}
