import { describe, it, expect, afterAll } from 'vitest';
import isWebKit from '.';

describe('isWebKit', () => {
  const originalNavigator = globalThis.navigator;

  afterAll(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  it('should return true for Safari user agent', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
      },
      writable: true,
    });

    expect(isWebKit()).toBe(true);
  });

  it('should return false for Chrome user agent', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
      },
      writable: true,
    });

    expect(isWebKit()).toBe(false);
  });
});
