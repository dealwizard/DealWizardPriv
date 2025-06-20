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
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return true; // Keep the message channel open for asynchronous response
});
