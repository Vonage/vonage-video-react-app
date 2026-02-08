import '@testing-library/jest-dom/vitest';
import { beforeEach, afterEach } from 'vitest';
import { setupFrontendTestEnvironment, mandatoryAfterEachCleanup } from '@common-test/environment';

beforeEach(() => {
  setupFrontendTestEnvironment();
});

afterEach(() => {
  mandatoryAfterEachCleanup();
});
