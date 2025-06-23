/**
 * Constants used across the Deal Wizard Chrome extension
 */

// Log level mapping
export const LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4
};

// Version information
export const VERSION = 'v0.5';

// Environment configuration
export const IS_TEST_ENVIRONMENT = false; // Set to true for test, false for production

// Base URLs
export const BUBBLE_API_BASE_URL = 'https://deal-wizard-home-61532.bubbleapps.io';
export const DEAL_WIZARD_BASE_URL = IS_TEST_ENVIRONMENT 
  ? `${BUBBLE_API_BASE_URL}/version-test/new_product_page`
  : `${BUBBLE_API_BASE_URL}/new_product_page`;

// API endpoints
export const BUBBLE_API_URL = IS_TEST_ENVIRONMENT
  ? `${BUBBLE_API_BASE_URL}/version-test`
  : BUBBLE_API_BASE_URL;

// Logging configuration (numeric values)
export const LOG_LEVEL = IS_TEST_ENVIRONMENT ? LOG_LEVELS.trace : LOG_LEVELS.info;
export const ANALYSIS_CHECKER_LOG_LEVEL = LOG_LEVELS.trace; 