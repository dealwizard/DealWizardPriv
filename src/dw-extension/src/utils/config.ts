import { config, AppConfig } from '../types/config';

/**
 * Configuration utility for accessing application settings
 */
export class ConfigService {
  /**
   * Get the current environment (development, production, etc.)
   */
  
  public static getEnvironment(): string {
    return config.environment;
  }
  

  public static getBubbleProductPage(uniqueId: string): string {
    if (!config.bubbleProductPageUrl) {
      throw new Error('Bubble product page URL is not defined in the configuration.');
    }
    
    return config.bubbleProductPageUrl.replace("{uniqueId}", uniqueId);
  }
  
  public static getBubblePropertiesApi(uniqueId: string): string {
    if (!config.bubbleApiStatus) {
      throw new Error('Bubble property page URL is not defined in the configuration.');
    }
    
    return config.bubbleApiStatus.replace("{uniqueId}", uniqueId);
  }
  

   public static apiWebhookUrl(): string {
    if (!config.apiWebhookUrl) {
      throw new Error('API n8n webhook URL is not defined in the configuration.');
    }
    
    return config.apiWebhookUrl;
  }
  

  /**
   * Check if a feature is enabled
   * @param featureName The name of the feature to check
   * @param defaultValue Default value if the feature isn't defined
   */
  public static isFeatureEnabled(featureName: string, defaultValue = false): boolean {
    if (config.features && featureName in config.features) {
      return config.features[featureName];
    }
    return defaultValue;
  }
  
  /**
   * Get a timeout value
   * @param timeoutName The name of the timeout to retrieve
   * @param defaultValue Default value if the timeout isn't defined
   */
  public static getTimeout(timeoutName: string, defaultValue = 5000): number {
    if (config.timeouts && timeoutName in config.timeouts) {
      return config.timeouts[timeoutName];
    }
    return defaultValue;
  }
  
  /**
   * Check if debug mode is enabled
   */
  public static isDebugEnabled(): boolean {
    return !!config.debug;
  }
  
  /**
   * Get the entire configuration object
   */
  public static getConfig(): AppConfig {
    return { ...config };
  }
}
