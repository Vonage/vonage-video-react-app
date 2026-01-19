import '../css/index.css';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import '../i18n';

// Mock scrollIntoView for jsdom environment
Element.prototype.scrollIntoView = vi.fn();

Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: vi.fn(() => {
    throw new Error(
      'HTMLMediaElement.play() was called during a test. ' +
        'This method is not implemented in jsdom. ' +
        'Mock or spy on it explicitly and assert the expected behavior.'
    );
  }),
});

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: vi.fn(() => {
    throw new Error(
      'HTMLMediaElement.pause() was called during a test. ' +
        'This method is not implemented in jsdom. ' +
        'Mock or spy on it explicitly and assert the expected behavior.'
    );
  }),
});

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value: vi.fn(() => {
    throw new Error(
      'HTMLMediaElement.load() was called during a test. ' +
        'This method is not implemented in jsdom. ' +
        'Mock or spy on it explicitly and assert the expected behavior.'
    );
  }),
});

HTMLCanvasElement.prototype.getContext = vi.fn(() => {
  throw new Error(
    'HTMLCanvasElement.getContext() was called during a test. ' +
      'This method is not implemented in jsdom. ' +
      'Mock or spy on it explicitly and assert the expected behavior.'
  );
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;

HTMLCanvasElement.prototype.toBlob = vi.fn(() => {
  throw new Error(
    'HTMLCanvasElement.toBlob() was called during a test. ' +
      'This method is not implemented in jsdom. ' +
      'Mock or spy on it explicitly and assert the expected behavior.'
  );
}) as unknown as typeof HTMLCanvasElement.prototype.toBlob;

afterEach(() => {
  cleanup();

  vi.clearAllMocks();
  vi.restoreAllMocks();
});
