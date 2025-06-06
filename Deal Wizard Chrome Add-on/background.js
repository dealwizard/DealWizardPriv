import LoggerFactory from './tools/logger.js';

const logger = LoggerFactory.getLogger('DEAL-WIZARD/BACKGROUND');

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "analyze") {
    logger.info('Handling analyze message with strategy:', message.strategy);
    // Create a new tab but don't send webhook request (it's handled in Wizard.js)
    (async () => {
      try {
        let createdTabId = null;
        let destinationUrl = message.destinationUrl;

        if (destinationUrl) {
          if (!destinationUrl.startsWith("http")) {
            destinationUrl = "https://" + destinationUrl;
          }
          const createdTab = await chrome.tabs.create({ url: destinationUrl, active: false });
          createdTabId = createdTab.id;
          logger.info("Deal tab opened in background:", destinationUrl);
        }
        
        sendResponse({ destinationUrl, tabId: createdTabId });
      } catch (err) {
        logger.error("Error handling analyze message:", err);
        sendResponse({ error: true });
      }
    })();
    return true; // Keep the message channel open
  } else if (message.type === "focusTab") {
    chrome.tabs.update(message.tabId, { active: true });
  }
});
