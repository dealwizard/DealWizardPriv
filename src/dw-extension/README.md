# DealWizard Chrome Extension

A Chrome Extension built with Manifest V3, TypeScript, and Webpack.

## Features

- Modern Chrome Extension with Manifest V3
- TypeScript for type safety
- Webpack for bundling
- Background service worker
- Content script for page interaction
- Popup UI

## Development

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Build Commands

- Build for production:

```bash
npm run build
```

- Development build:

```bash
npm run dev
```

- Watch mode (rebuilds on file changes):

```bash
npm run watch
```

### Load the Extension in Chrome

1. Build the extension using one of the commands above
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `dist` folder of this project
5. The extension should now be installed and ready to use

## Project Structure

```
├── src/                  # Source files
│   ├── assets/           # Extension icons and images
│   ├── background.ts     # Background service worker
│   ├── content.ts        # Content script
│   ├── popup.html        # Popup UI HTML
│   ├── popup.ts          # Popup UI JavaScript
│   └── manifest.json     # Extension manifest
├── dist/                 # Compiled files (generated)
├── node_modules/         # Dependencies (generated)
├── package.json          # Project metadata and scripts
├── tsconfig.json         # TypeScript configuration
└── webpack.config.js     # Webpack configuration
```

## License

ISC
