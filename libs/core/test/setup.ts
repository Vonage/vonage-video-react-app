import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';
import mediaDevices from '@common/test/mocks/mediaDevices';

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  globalThis.navigator.mediaDevices = mediaDevices;
});

afterEach(() => {
  cleanup();

  vi.clearAllMocks();
  vi.restoreAllMocks();
});
