import '@testing-library/jest-dom/vitest';
import { beforeEach, afterEach } from 'vitest';
import {
  setupFrontendTestEnvironment,
  mandatoryAfterEachCleanup,
} from '@common-test/frontendEnvironment';

beforeEach(() => {
  setupFrontendTestEnvironment();
});

afterEach(() => {
  mandatoryAfterEachCleanup();
});
