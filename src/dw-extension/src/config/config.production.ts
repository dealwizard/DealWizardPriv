export const ENVIRONMENT_CONFIG = {
  apiUrl: "https://api.dealwizard.app",
  apiWebhookUrl: "https://api.dealwizard.app/webhook/production",
  bubbleApiUrl: "https://deal-wizard-home.bubbleapps.io",
  bubbleProductPageUrl: "https://deal-wizard-home.bubbleapps.io/new_product_page/${uniqueId}",
  bubbleApiStatus: "https://deal-wizard-home.bubbleapps.io/api/1.1/obj/properties/{uniqueId}",
  environment: "production",
  welcomePageUrl: "https://deal-wizard-home.bubbleapps.io/welcome_addon",
  features: {
    notifications: true,
    analytics: true
  },
  timeouts: {
    api: 10000,
    animation: 300
  },
  debug: false,
  firebase: {
    apiKey: "PROD_API_KEY",
    authDomain: "prod-domain.firebaseapp.com",
    projectId: "prod-project-id",
    storageBucket: "prod-bucket.firebasestorage.app",
    messagingSenderId: "PROD_SENDER_ID",
    appId: "PROD_APP_ID"
  }
};