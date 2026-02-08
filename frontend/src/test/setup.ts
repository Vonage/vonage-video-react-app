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
