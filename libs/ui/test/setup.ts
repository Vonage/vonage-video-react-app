import '@testing-library/jest-dom/vitest';
import { beforeEach, afterEach } from 'vitest';
import { setupFrontendTestEnvironment, mandatoryAfterEachCleanup } from '@web-test/environment';

beforeEach(() => {
  setupFrontendTestEnvironment();
});

afterEach(() => {
  mandatoryAfterEachCleanup();
});
