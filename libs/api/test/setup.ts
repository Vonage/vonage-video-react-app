import { afterEach, vi } from 'vitest';

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'production');
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
