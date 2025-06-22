/**
 * Utility functions and shared types for the extension
 */

// Import types from centralized type definitions
import {
  ExtensionMessage,
  ExtensionResponse,
  StorageKeys
} from './types';

// Utility functions
export const sendMessage = async (message: ExtensionMessage): Promise<ExtensionResponse> => {
  try {
    const response = await chrome.runtime.sendMessage(message);
    return response || { success: false, error: 'No response' };
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Get storage data with type safety
export const getStorageData = async <T>(key: StorageKeys): Promise<T | null> => {
  try {
    const data = await chrome.storage.local.get(key);
    return (data[key] as T) || null;
  } catch (error) {
    console.error(`Error getting storage data for key ${key}:`, error);
    return null;
  }
};

// Set storage data with type safety
export const setStorageData = async <T>(key: StorageKeys, value: T): Promise<boolean> => {
  try {
    await chrome.storage.local.set({ [key]: value });
    return true;
  } catch (error) {
    console.error(`Error setting storage data for key ${key}:`, error);
    return false;
  }
};

// Logger with environment check
export const logger = {
  log: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DW Extension] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[DW Extension Error] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[DW Extension Warning] ${message}`, ...args);
  },
};
