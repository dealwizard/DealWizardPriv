/**
 * Types for extension settings and configuration
 * Contains interfaces for extension settings, storage keys, and configuration options
 */

// Storage keys enumeration
export enum StorageKeys {
  SETTINGS = 'settings',
  USER_DATA = 'userData',
  ENABLED = 'isEnabled',
  GOALS = 'goals',
  STRATEGIES = 'strategies',
  FCM_TOKEN = 'fcmToken',
  USER_ID = 'userId'
}

// Extension settings interface
export interface ExtensionSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  features?: {
    [key: string]: boolean;
  };
}

// User data interface
export interface UserData {
  lastUsed: string;
  [key: string]: any;
}

// Feature flags interface
export interface FeatureFlags {
  highlightContent: boolean;
  showAnalytics: boolean;
  [key: string]: boolean;
}
