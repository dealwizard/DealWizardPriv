// Popup script
import { sendMessage, ExtensionResponse, StorageKeys, ExtensionSettings, logger } from './utils';

logger.log('Popup script loaded');

// DOM elements
const actionButton = document.getElementById('actionButton') as HTMLButtonElement;
const actionStatus = document.getElementById('actionStatus') as HTMLDivElement;
const themeToggle = document.getElementById('themeToggle') as HTMLInputElement;
const notificationsToggle = document.getElementById('notificationsToggle') as HTMLInputElement;
const analyticsToggle = document.getElementById('analyticsToggle') as HTMLInputElement;

// Current settings
let currentSettings: ExtensionSettings;

// Initialize the popup UI with settings from storage
const initializeUI = async () => {
  try {
    // Get settings from background script
    const response = await sendMessage({ action: 'getSettings' });
    
    if (response.success && response.data) {
      currentSettings = response.data as ExtensionSettings;
      
      // Apply theme
      const isDarkTheme = currentSettings.theme === 'dark';
      document.body.className = isDarkTheme ? 'dark' : 'light';
      themeToggle.checked = isDarkTheme;
      
      // Apply other settings
      notificationsToggle.checked = currentSettings.notifications;
      analyticsToggle.checked = currentSettings.features?.showAnalytics || false;
      
      logger.log('Settings loaded:', currentSettings);
    }
  } catch (error) {
    logger.error('Error initializing UI:', error);
    actionStatus.textContent = 'Error loading settings';
  }
};

// Save settings to storage
const saveSettings = async (settings: Partial<ExtensionSettings>) => {
  try {
    const newSettings = { ...currentSettings, ...settings };
    const response = await sendMessage({ 
      action: 'updateSettings', 
      payload: newSettings 
    });
    
    if (response.success) {
      currentSettings = newSettings;
      logger.log('Settings saved:', newSettings);
      return true;
    } else {
      logger.error('Error saving settings:', response.error);
      return false;
    }
  } catch (error) {
    logger.error('Error saving settings:', error);
    return false;
  }
};

// Handle highlight action
const handleHighlightAction = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab?.id) {
      actionButton.disabled = true;
      actionButton.textContent = 'Processing...';
      actionStatus.textContent = 'Analyzing page content...';
      
      // Sending a message to the content script
      chrome.tabs.sendMessage(tab.id, { action: 'performAction' }, (response: ExtensionResponse) => {
        if (chrome.runtime.lastError) {
          logger.error('Error:', chrome.runtime.lastError);
          actionButton.textContent = 'Error';
          actionStatus.textContent = 'Error: Content script not available';
          setTimeout(() => {
            actionButton.disabled = false;
            actionButton.textContent = 'Highlight Page Headers';
          }, 1500);
          return;
        }
        
        logger.log('Response from content script:', response);
        
        // Update button and status text based on the response
        if (response.success) {
          const elemCount = response.data?.count || 0;
          const state = response.data?.state;
          
          actionButton.textContent = 'Success!';
          
          if (state === 'added') {
            actionStatus.textContent = `Highlighted ${elemCount} headers on this page`;
          } else {
            actionStatus.textContent = `Removed highlighting from ${elemCount} headers`;
          }
        } else {
          actionButton.textContent = 'Failed';
          actionStatus.textContent = `Error: ${response.error || 'Unknown error'}`;
        }
        
        // Reset button state after a delay
        setTimeout(() => {
          actionButton.disabled = false;
          actionButton.textContent = 'Highlight Page Headers';
        }, 1500);
      });
    }
  } catch (error) {
    logger.error('Error performing action:', error);
    actionButton.disabled = false;
    actionButton.textContent = 'Highlight Page Headers';
    actionStatus.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

// Set up event listeners
const setupEventListeners = () => {
  // Action button
  actionButton?.addEventListener('click', handleHighlightAction);
  
  // Theme toggle
  themeToggle?.addEventListener('change', () => {
    const newTheme = themeToggle.checked ? 'dark' : 'light';
    document.body.className = newTheme;
    saveSettings({ theme: newTheme });
  });
  
  // Notifications toggle
  notificationsToggle?.addEventListener('change', () => {
    saveSettings({ notifications: notificationsToggle.checked });
  });
  
  // Analytics toggle
  analyticsToggle?.addEventListener('change', () => {
    saveSettings({ 
      features: { 
        ...currentSettings.features,
        showAnalytics: analyticsToggle.checked 
      } 
    });
  });
};

// Initialize the popup UI when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeUI();
  setupEventListeners();
});
