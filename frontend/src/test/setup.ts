import '../i18n';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll } from 'vitest';

import {
  setupFrontendTestEnvironment,
  mandatoryAfterEachCleanup,
} from '@common-test/frontendEnvironment';

beforeAll(() => {
  setupFrontendTestEnvironment();
});

afterEach(() => {
  mandatoryAfterEachCleanup();
});
