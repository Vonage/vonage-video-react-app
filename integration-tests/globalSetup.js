/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('@playwright/test');
const path = require('path');
const { exec } = require('child_process');

module.exports = async () => {
  const isOperaProject = process.argv.some((arg) => arg.includes('--project=Opera'));
  const isMac = process.platform === 'darwin';
  const executablePath = isMac ? '/Applications/Opera.app/Contents/MacOS/Opera' : '/usr/bin/opera';
  if (isOperaProject) {
    const projectType = process.env.PROJECT_TYPE || 'Opera';
    process.env.PROJECT_TYPE = projectType;
    const operaPath = path.resolve(executablePath);

    exec(`${operaPath} --remote-debugging-port=9222`, (err) => {
      if (err) {
        console.error(`Error starting Opera: ${err}`);
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
      global.browser = browser;
    } catch (error) {
      console.error('Error connecting to Opera:', error);
    }
  }
};
