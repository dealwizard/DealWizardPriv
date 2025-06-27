// Background script (Service Worker in Manifest V3)
import { initializeApp } from '@firebase/app';
import { getToken } from '@firebase/messaging';
import { getMessaging, onBackgroundMessage } from '@firebase/messaging/sw';
import { AnalyzeMessage, ExtensionMessage, ExtensionResponse, ExtensionSettings, FocusTabMessage, StorageKeys } from './types';
import { logger } from './utils';
import { ConfigService } from './utils/config';

logger.log('Background script initialized');
logger.log(`Environment: ${ConfigService.getEnvironment()}`);
logger.log(`Debug mode: ${ConfigService.isDebugEnabled()}`);

// Now this will work in service worker context
const firebaseConfig = ConfigService.getConfig().firebase;
if (!firebaseConfig) {
  throw new Error('Firebase configuration is missing');
}

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);


// Example of using the chrome API
chrome.runtime.onInstalled.addListener(async (details) => {
  logger.log('Extension installed');

  // Open welcome page on fresh install (not on updates)
  if (details.reason === 'install') {
    try {
      const welcomeUrl = ConfigService.getConfig().welcomePageUrl;
      if (welcomeUrl) {
        await chrome.tabs.create({ 
          url: welcomeUrl,
          active: true 
        });
        logger.log('Welcome page opened:', welcomeUrl);
      }
    } catch (err) {
      logger.error('Failed to open welcome page:', err);
    }
  }

  // Handle FCM token generation
  try {
    const token = await getToken(messaging, {
      serviceWorkerRegistration: (self as any).registration,
    });
    console.log('FCM token:', token);
    const stored = await chrome.storage.local.get(StorageKeys.FCM_TOKEN);

    if (stored.fcmToken !== token) {
      await chrome.storage.local.set({
        [StorageKeys.FCM_TOKEN]: token,
      });
    }
  } catch (err) {
    console.error('Failed to get FCM token:', err);
  }
});

// Example of handling messages from content script or popup
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse: (response: ExtensionResponse) => void) => {
  logger.log('Received message:', message);

  switch (message.action) {
    case 'getData':
      // Example of sending response back
      sendResponse({ success: true, data: 'Here is the data you requested' });
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
      if (!destinationUrl.startsWith('http')) {
        destinationUrl = 'https://' + destinationUrl;
      }
      const createdTab = await chrome.tabs.create({ url: destinationUrl, active: false });
      createdTabId = createdTab.id;
      logger.log('Deal tab opened in background:', destinationUrl);
    }

    sendResponse({
      success: true,
      data: {
        destinationUrl,
        tabId: createdTabId,
      },
    });
  } catch (err) {
    logger.error('Error handling analyze message:', err);
    sendResponse({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

/**
 * Handles focusTab message
 * Brings the specified tab to focus
 */
function handleFocusTabMessage(message: FocusTabMessage): void {
  logger.log('Focusing tab:', message.tabId);
  chrome.tabs.update(message.tabId, { active: true }).catch(err => logger.error('Error focusing tab:', err));
}

onBackgroundMessage(messaging, payload => {
  console.log('FCM background message received:', payload);

  const notification = payload.notification || {};
  const data = payload.data || {};

  const title = notification.title ?? 'New Message';
  const body = notification.body ?? '';
  const icon = notification.icon ?? 'icon.png';

  const clickAction = data.click_action || '/'; // ✅ safe fallback

  (self as any).registration.showNotification(title, {
    body,
    icon,
    data: { url: clickAction },
  });
});
