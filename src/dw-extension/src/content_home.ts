/**
 * Content script for Deal Wizard home website
 * Reads userId from localStorage and communicates with extension
 */

console.log('Deal Wizard - Content Home script loaded');

// Function to read userId from localStorage
function getUserId(): string | null {
    try {
        const userId = localStorage.getItem('userId');
        console.log('Deal Wizard - Retrieved userId from localStorage:', userId);
        return userId;
    } catch (error) {
        console.error('Deal Wizard - Error reading userId from localStorage:', error);
        return null;
    }
}

// Function to send userId to background script
function sendUserIdToBackground(userId: string | null): void {
    if (chrome.runtime) {
        chrome.runtime.sendMessage({
            action: 'USER_ID_DETECTED',
            userId: userId,
            timestamp: Date.now(),
            url: window.location.href
        }).catch((error) => {
            console.error('Deal Wizard - Error sending message to background:', error);
        });
    }
}

// Function to monitor localStorage changes
function monitorUserIdChanges(): void {
    let currentUserId = getUserId();
    
    // Send initial userId if exists
    if (currentUserId) {
        sendUserIdToBackground(currentUserId);
    }
    
    // Monitor for changes using storage events
    window.addEventListener('storage', (event) => {
        if (event.key === 'userId') {
            console.log('Deal Wizard - userId changed in localStorage:', event.newValue);
            sendUserIdToBackground(event.newValue);
            currentUserId = event.newValue;
        }
    });
    
    // Also check periodically in case of programmatic changes
    setInterval(() => {
        const newUserId = getUserId();
        if (newUserId !== currentUserId) {
            console.log('Deal Wizard - userId changed (detected via polling):', newUserId);
            sendUserIdToBackground(newUserId);
            currentUserId = newUserId;
        }
    }, 2000); // Check every 2 seconds
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        monitorUserIdChanges();
    });
} else {
    // DOM is already ready
    monitorUserIdChanges();
}

// Also listen for page visibility changes to re-check when user returns to tab
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        const userId = getUserId();
        sendUserIdToBackground(userId);
    }
});