import '../i18n';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll } from 'vitest';
import { setupFrontendTestEnvironment, mandatoryAfterEachCleanup } from '@web-test/environment';
import { env } from '../env';

/**
 * Light-mode Vera CSS design token variables.
 * These mirror the values emitted by the veraUI Tailwind plugin at :root so that
 * jsdom can resolve `var(--vera-*)` references in computed styles during tests.
 */
const VERA_CSS_VARS: Record<string, string> = {
  '--vera-accent': '#FFFFFF',
  '--vera-alert-background': '#FFEEF2',
  '--vera-alert-text': '#CD0000',
  '--vera-background': '#F5F0FD',
  '--vera-border': '#E6E6E6',
  '--vera-dark-background': '#202124',
  '--vera-dark-grey': '#333333',
  '--vera-dark-grey-hover': '#292828',
  '--vera-dark-grey-opacity': '#333333CD',
  '--vera-disabled': '#E6E6E6',
  '--vera-error': '#E61D1D',
  '--vera-error-hover': '#CD0000',
  '--vera-information': '#0276D5',
  '--vera-on-accent': '#000000',
  '--vera-on-background': '#757575',
  '--vera-on-dark-grey': '#FFFFFF',
  '--vera-on-error': '#FFFFFF',
  '--vera-on-information': '#FFFFFF',
  '--vera-on-primary': '#FFFFFF',
  '--vera-on-secondary': '#FFFFFF',
  '--vera-on-success': '#FFFFFF',
  '--vera-on-surface': '#929292',
  '--vera-on-tertiary': '#FFFFFF',
  '--vera-on-warning': '#FFFFFF',
  '--vera-primary': '#9941FF',
  '--vera-secondary': '#000000',
  '--vera-success': '#008080',
  '--vera-surface': '#FFFFFF',
  '--vera-tertiary': '#757575',
  '--vera-text-disabled': '#B3B3B3',
  '--vera-text-primary': '#000000',
  '--vera-text-secondary': '#757575',
  '--vera-warning': '#CC8800',
};

beforeAll(() => {
  // Apply Vera design token CSS variables to the jsdom root so computed styles
  // can resolve var(--vera-*) references used by components after theme migration.
  for (const [name, value] of Object.entries(VERA_CSS_VARS)) {
    document.documentElement.style.setProperty(name, value);
  }

  setupFrontendTestEnvironment();
});

afterEach(() => {
  env.reset();
  mandatoryAfterEachCleanup();
});
