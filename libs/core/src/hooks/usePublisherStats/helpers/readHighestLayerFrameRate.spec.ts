import { describe, expect, it } from 'vitest';
import type { VideoLayerStats } from '@vonage/client-sdk-video';
import readHighestLayerFrameRate from './readHighestLayerFrameRate';

describe('readHighestLayerFrameRate', () => {
  it('returns null when no layers are reported', () => {
    expect(readHighestLayerFrameRate([])).toBeNull();
    expect(readHighestLayerFrameRate(undefined)).toBeNull();
  });

  it('returns the highest encoded frame rate', () => {
    const layers = [{ encodedFrameRate: 5 }, { encodedFrameRate: 24 }] as VideoLayerStats[];

    expect(readHighestLayerFrameRate(layers)).toBe(24);
  });

  it('ignores layers that report no frame rate, which is how idle encodings arrive', () => {
    const layers = [
      { width: 320, height: 180, bitrate: 0 },
      { width: 640, height: 360, encodedFrameRate: 30, bitrate: 800000 },
    ] as unknown as VideoLayerStats[];

    expect(readHighestLayerFrameRate(layers)).toBe(30);
  });

  it('keeps 0 fps, which is a real value for a stalled encoding', () => {
    const layers = [{ encodedFrameRate: 0 }] as VideoLayerStats[];

    expect(readHighestLayerFrameRate(layers)).toBe(0);
  });
});
