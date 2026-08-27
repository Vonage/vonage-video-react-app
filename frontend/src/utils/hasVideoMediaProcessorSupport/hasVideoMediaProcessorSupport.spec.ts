import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import {
  hasVideoMediaProcessorSupport,
  hasVideoMediaProcessorSupportAsync,
} from './hasVideoMediaProcessorSupport';

vi.mock('@vonage/client-sdk-video', () => ({
  hasMediaProcessorSupport: vi.fn(),
}));

describe('hasVideoMediaProcessorSupport', () => {
  beforeEach(() => {
    vi.mocked(hasMediaProcessorSupport).mockReset();
    delete (hasMediaProcessorSupport as { promise?: unknown }).promise;
  });

  it('calls the SDK with video', () => {
    vi.mocked(hasMediaProcessorSupport).mockReturnValue(true);

    expect(hasVideoMediaProcessorSupport()).toBe(true);
    expect(hasMediaProcessorSupport).toHaveBeenCalledWith('video');
  });
});

describe('hasVideoMediaProcessorSupportAsync', () => {
  beforeEach(() => {
    vi.mocked(hasMediaProcessorSupport).mockReset();
    delete (hasMediaProcessorSupport as { promise?: unknown }).promise;
  });

  it('falls back to the sync video check when promise is unavailable', async () => {
    vi.mocked(hasMediaProcessorSupport).mockReturnValue(true);

    await expect(hasVideoMediaProcessorSupportAsync()).resolves.toBe(true);
    expect(hasMediaProcessorSupport).toHaveBeenCalledWith('video');
  });

  it('prefers promise over the sync check', async () => {
    const promise = vi.fn().mockResolvedValue(true);
    vi.mocked(hasMediaProcessorSupport).mockReturnValue(false);
    Object.assign(hasMediaProcessorSupport, { promise });

    await expect(hasVideoMediaProcessorSupportAsync()).resolves.toBe(true);
    expect(promise).toHaveBeenCalledWith('video');
    expect(hasMediaProcessorSupport).not.toHaveBeenCalled();
  });
});
