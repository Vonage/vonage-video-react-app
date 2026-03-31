import { describe, expect, it } from '@jest/globals';

const doc = (globalThis as unknown as { document: { cookie: string } }).document;

/**
 * Tests for documentPolyfill.js.
 * The polyfill runs as a Jest setup file before these tests, so document is already defined.
 */
describe('documentPolyfill', () => {
  it('defines globalThis.document when missing', () => {
    expect(doc).toBeDefined();
    expect(typeof doc).toBe('object');
  });

  it('provides document.cookie getter that returns a string', () => {
    expect(doc.cookie).toBeDefined();
    expect(typeof doc.cookie).toBe('string');
  });

  it('allows setting and reading document.cookie', () => {
    const testValue = 'test=value; path=/';
    doc.cookie = testValue;
    expect(doc.cookie).toBe(testValue);
  });
});
