import '../i18n';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll } from 'vitest';
import { setupFrontendTestEnvironment, mandatoryAfterEachCleanup } from '@web-test/environment';
import { env } from '../env';

beforeAll(() => {
  setupFrontendTestEnvironment();
});

afterEach(() => {
  env.reset();
  mandatoryAfterEachCleanup();
});
