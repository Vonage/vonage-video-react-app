import { afterEach, describe, expect, it, vi } from 'vitest';
import hasMediaProcessorSupport, {
  resetMediaProcessorSupportCache,
} from './hasMediaProcessorSupport';

const { sdkHasMediaProcessorSupport } = vi.hoisted(() => ({
  sdkHasMediaProcessorSupport: vi.fn<[mediaType?: 'audio' | 'video' | 'both'], boolean>(),
}));

vi.mock('@vonage/client-sdk-video', () => ({
  hasMediaProcessorSupport: sdkHasMediaProcessorSupport,
}));

afterEach(() => {
  resetMediaProcessorSupportCache();
  sdkHasMediaProcessorSupport.mockReset();
});

describe('hasMediaProcessorSupport', () => {
  it('returns the underlying SDK result', () => {
    sdkHasMediaProcessorSupport.mockReturnValue(true);

    expect(hasMediaProcessorSupport('both')).toBe(true);
    expect(sdkHasMediaProcessorSupport).toHaveBeenCalledWith('both');
  });

  it('runs the deprecated SDK check only once per media type', () => {
    sdkHasMediaProcessorSupport.mockReturnValue(true);

    hasMediaProcessorSupport('both');
    hasMediaProcessorSupport('both');
    hasMediaProcessorSupport('both');

    expect(sdkHasMediaProcessorSupport).toHaveBeenCalledTimes(1);
  });

  it('caches each media type independently', () => {
    sdkHasMediaProcessorSupport.mockImplementation((mediaType) => mediaType === 'audio');

    expect(hasMediaProcessorSupport('audio')).toBe(true);
    expect(hasMediaProcessorSupport('video')).toBe(false);
    expect(hasMediaProcessorSupport('audio')).toBe(true);

    expect(sdkHasMediaProcessorSupport).toHaveBeenCalledTimes(2);
  });

  it('defaults to "both" when no media type is passed', () => {
    sdkHasMediaProcessorSupport.mockReturnValue(false);

    expect(hasMediaProcessorSupport()).toBe(false);
    expect(sdkHasMediaProcessorSupport).toHaveBeenCalledWith('both');
  });

  it('re-reads from the SDK after the cache is reset', () => {
    sdkHasMediaProcessorSupport.mockReturnValue(true);
    expect(hasMediaProcessorSupport('both')).toBe(true);

    resetMediaProcessorSupportCache();
    sdkHasMediaProcessorSupport.mockReturnValue(false);

    expect(hasMediaProcessorSupport('both')).toBe(false);
    expect(sdkHasMediaProcessorSupport).toHaveBeenCalledTimes(2);
  });
});
