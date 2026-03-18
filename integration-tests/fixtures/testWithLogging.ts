/**
 * This file exports a custom playwright fixture which extends Page to log all browser console messages
 * as well as any uncaught errors.
 * See for reference:
 * - Playwright Fixtures https://playwright.dev/docs/test-fixtures
 * - Console Messages https://playwright.dev/python/docs/api/class-consolemessage
 * - Example override page fixture https://github.com/microsoft/playwright/issues/7051#issuecomment-859916019
 */
import { BrowserContext, Page, test as baseTest } from '@playwright/test';

const isDebugMode = process.env.debugMode === 'true';

const baseURL = isDebugMode ? 'http://localhost:5173/' : 'http://127.0.0.1:3345/';

const addLogger = (page: Page, context: BrowserContext) => {
  // Get page index to help identify which tab logs are coming from
  const index = context.pages().length;
  // log all page Console Message errors to node console
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
  return baseTest.extend({
    context: async ({ context }, use) => {
      // Clear localStorage on every page load to ensure consistent initial state
      await context.addInitScript(() => {
        localStorage.clear();
      });
      await use(context);
    },
    page: async ({ page, context }, use) => {
      const loggedPage = addLogger(page, context);
      await use(loggedPage);
    },
  });
})();

export { test, baseURL };
