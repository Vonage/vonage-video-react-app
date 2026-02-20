import { describe, it, expect, afterEach } from 'vitest';
import isSinkIdSupported from '.';

describe('isSinkIdSupported', () => {
  const originalPrototype = Object.getOwnPropertyDescriptor(HTMLMediaElement, 'prototype');

  afterEach(() => {
    if (originalPrototype) {
      Object.defineProperty(HTMLMediaElement, 'prototype', originalPrototype);
    }
  });

  it('should return true when setSinkId is in HTMLMediaElement.prototype', () => {
    Object.defineProperty(HTMLMediaElement.prototype, 'setSinkId', {
      value: () => Promise.resolve(),
      configurable: true,
    });

    expect(isSinkIdSupported()).toBe(true);
  });

  it('should return false when setSinkId is not in HTMLMediaElement.prototype', () => {
    // Delete setSinkId if it exists
    if ('setSinkId' in HTMLMediaElement.prototype) {
      delete (HTMLMediaElement.prototype as Partial<typeof HTMLMediaElement.prototype>).setSinkId;
    }

    expect(isSinkIdSupported()).toBe(false);
  });
});
