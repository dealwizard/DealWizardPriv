import Logger from './tools/logger.js';

const EXTENSION_ID = 'cbdnhcnlopepnhnkdfmhnoldjbjmjfjp'; // replace with your real extension ID

const CDP = require('chrome-remote-interface');
const URL_TO_OPEN = 'https://www.rightmove.co.uk/properties/156184649#/?channel=RES_BUY'; // change this to your test page

CDP(async (client) => {
  const { Runtime, Target } = client;
  try {
    // Disable and re-enable the extension
    const reloadCode = `
      chrome.management.setEnabled('${EXTENSION_ID}', false, () => {
        chrome.management.setEnabled('${EXTENSION_ID}', true);
      });
    `;
    await Runtime.evaluate({ expression: reloadCode });

    // Open a new tab with your test URL
    await Target.createTarget({ url: URL_TO_OPEN });

    Logger.info('Extension reloaded and test page opened!');
  } catch (err) {
    Logger.error('Error:', err);
  } finally {
    await client.close();
  }
}).on('error', (err) => {
  Logger.error('Cannot connect to Chrome:', err);
});
