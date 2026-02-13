import '../i18n';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll } from 'vitest';

import { setupFrontendTestEnvironment, mandatoryAfterEachCleanup } from '@common-test/environment';

beforeAll(() => {
  setupFrontendTestEnvironment();
});

afterEach(() => {
  mandatoryAfterEachCleanup();
});

process.on('unhandledRejection', (_reason) => {
  // swallow expected test rejections
});

window.addEventListener('unhandledrejection', (event) => {
  if (String(event.reason).includes('Expected')) {
    event.preventDefault();
  }
});
