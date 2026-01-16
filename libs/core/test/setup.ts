import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';
import mediaDevicesMock from '@common/test/mocks/mediaDevicesMock';

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  globalThis.navigator.mediaDevices = mediaDevicesMock;
});

afterEach(() => {
  cleanup();

  vi.clearAllMocks();
  vi.restoreAllMocks();
});
