/* eslint-disable no-empty-pattern */
/**
 * This file exports a custom playwright fixture which extends Page to log all browser console messages
 * as well as any uncaught errors.
 * See for reference:
 * - Playwright Fixtures https://playwright.dev/docs/test-fixtures
 * - Console Messages https://playwright.dev/python/docs/api/class-consolemessage
 * - Example override page fixture https://github.com/microsoft/playwright/issues/7051#issuecomment-859916019
 */
import { BrowserContext, Page, test as baseTest } from '@playwright/test';
import startElectronApp from '../electronHelper';

const projectType = process.env.PROJECT_TYPE;
const baseURL = 'http://127.0.0.1:3345/';

const addLogger = (page: Page, context: BrowserContext) => {
  // Get page index to help identify which tab logs are coming from
  const index = context.pages().length;
  // log only errors of Console Messages to node console
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`Browser console error from page ${index}: ${msg.text()}`);
    }
  });
  // log all uncaught page errors to node console
  page.on('pageerror', (err) => {
    console.error(`Browser uncaught error from page ${index}: "${err.message}" - ${err.stack}`);
  });
  return page;
};

const test = (() => {
  if (projectType === 'Electron') {
    return baseTest.extend({
      page: async ({}, use) => {
        const electronApp = await startElectronApp();
        const window = await electronApp.waitForEvent('window');
        await window.waitForSelector('button:text("Join")');

        const loggedWindow = addLogger(window, window.context());
        await use(loggedWindow);

        await electronApp.close();
      },
      context: async ({}, use) => {
        const electronApp = await startElectronApp();
        const context = electronApp.context();
        await use(context);

        await electronApp.close();
      },
    });
  }

  if (projectType === 'Opera') {
    return baseTest.extend({
      page: async ({ context }, use) => {
        const page = await context.newPage();
        const loggedPage = addLogger(page, context);
        await use(loggedPage);
        await page.close();
      },
    });
  }

  return baseTest.extend({
    page: async ({ page, context }, use) => {
      const loggedPage = addLogger(page, context);
      await use(loggedPage);
    },
  });
})();

export { test, baseURL };
