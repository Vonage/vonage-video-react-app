import { describe, expect, it } from 'vitest';
import waitForStylesheets from './waitForStylesheets';

describe('waitForStylesheets', () => {
  it('resolves only after every pending stylesheet has loaded or failed', async () => {
    const target = document.implementation.createHTMLDocument('');
    const loadingLink = target.createElement('link');
    loadingLink.rel = 'stylesheet';
    const failingLink = target.createElement('link');
    failingLink.rel = 'stylesheet';
    target.head.append(loadingLink, failingLink);

    let isSettled = false;
    const waiting = waitForStylesheets(target).then(() => {
      isSettled = true;
    });

    loadingLink.dispatchEvent(new Event('load'));
    await Promise.resolve();
    expect(isSettled).toBe(false);

    failingLink.dispatchEvent(new Event('error'));
    await waiting;
    expect(isSettled).toBe(true);
  });
});
