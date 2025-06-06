# Deal Wizard Chrome Extension

A Chrome extension for analyzing real estate deals on Rightmove. The extension helps investors analyze properties using different investment strategies (FLIP, BTL, HMO) and custom goals.

## Features

- Property analysis with multiple investment strategies:
  - FLIP (Fix and Flip)
  - BTL (Buy to Let)
  - HMO (House in Multiple Occupation)
- Custom goal setting for each analysis
- Automated deal analysis through webhook integration
- Beautiful UI with visual feedback and animations
- Background tab opening for analyzed deals

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Navigate to a property listing on Rightmove
2. Select your investment strategy (FLIP, BTL, or HMO)
3. Set your investment goal (optional)
4. Click the Deal Wizard icon to analyze the property
5. Wait for the analysis to complete (~2 minutes)
6. The analyzed deal will open in a new background tab

## Development

The extension is built using vanilla JavaScript with a modular architecture. Key components:

- `Wizard.js`: Main component handling user interaction and analysis flow
- `Strategy.js`: Manages investment strategy selection
- `Deal.js`: Handles the analyzed deal presentation
- `background.js`: Manages background tasks and tab operations

## Version History

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.

## License

ISC License - See LICENSE file for details 