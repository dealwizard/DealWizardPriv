# DealWizard Chrome Extension

A Chrome Extension for DealWizzard.ai that helps analyze properties on Rightmove.

## Environment Configuration System

The extension supports multiple environments (development, staging, production) with different configuration settings.

### Available Environments

- `development`: For local development and testing
- `staging`: For pre-production testing
- `production`: For production releases

### Configuration Files

Configuration files are located in the `src/config/` directory:

- `config.development.json`: Development environment settings
- `config.staging.json`: Staging environment settings
- `config.production.json`: Production environment settings
- `config.template.json`: Template for creating new configurations

### Building for Different Environments

You can build the extension for different environments using:

```bash
# Using npm scripts
npm run build:dev     # Development build
npm run build:staging # Staging build
npm run build:prod    # Production build (default)

# Using build script directly
./build-extension.sh -e development
./build-extension.sh -e staging
./build-extension.sh -e production
```

### Packaging for Distribution

To create a distribution package (zip file) for a specific environment:

```bash
# Package the extension (default: production)
./package-release.sh

# Package for a specific environment
./package-release.sh -e development
./package-release.sh -e staging
./package-release.sh -e production
```

This will create a zip file named `DealWizzard_[environment]_[version].zip` in the project root directory.

### Using Configuration in Code

To access configuration values in your code:

```typescript
import { ConfigService } from './utils/config';

// Get the current environment
const env = ConfigService.getEnvironment();

// Get the API URL for the current environment
const apiUrl = ConfigService.getApiUrl();

// Check if a feature is enabled
if (ConfigService.isFeatureEnabled('notifications')) {
  // Enable notifications
}

// Get timeout values
const apiTimeout = ConfigService.getTimeout('api');

// Check if in debug mode
if (ConfigService.isDebugEnabled()) {
  // Enable debug features
}
```
