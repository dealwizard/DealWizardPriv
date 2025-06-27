import { ENVIRONMENT_CONFIG } from '../config/environment';

export interface AppConfig {
  apiUrl: string;
  apiWebhookUrl: string;
  bubbleApiUrl: string;
  bubbleProductPageUrl: string;
  bubbleApiStatus: string;
  environment: string;
  welcomePageUrl: string;
  features: {
    notifications: boolean;
    analytics: boolean;
    [key: string]: boolean;
  };
  timeouts: {
    api: number;
    animation: number;
    [key: string]: number;
  };
  debug?: boolean;
  firebase?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  [key: string]: any;
}

/**
 * Configuration that works in all contexts (window, service worker, etc.)
 */
export const config: AppConfig = ENVIRONMENT_CONFIG;
