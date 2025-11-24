import '../css/index.css';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import '../i18n';

// Mock scrollIntoView for jsdom environment
Element.prototype.scrollIntoView = vi.fn();

afterEach(() => {
  cleanup();

  vi.clearAllMocks();
  vi.restoreAllMocks();
});
