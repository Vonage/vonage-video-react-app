import { describe, expect, it } from 'vitest';
import type { VideoLayerStats } from '@vonage/client-sdk-video';
import readHighestLayerResolution from './readHighestLayerResolution';

describe('readHighestLayerResolution', () => {
  it('returns null when no layers are reported', () => {
    expect(readHighestLayerResolution([])).toBeNull();
    expect(readHighestLayerResolution(undefined)).toBeNull();
  });

  it('returns the largest layer by area', () => {
    const layers = [
      { width: 640, height: 360 },
      { width: 320, height: 180 },
    ] as VideoLayerStats[];

    expect(readHighestLayerResolution(layers)).toEqual({ width: 640, height: 360 });
  });

  it('ignores layers that report no dimensions, which is how idle encodings arrive', () => {
    const layers = [
      { encodedFrameRate: 4.65, bitrate: 1, scalabilityMode: 'L1T3' },
      { width: 640, height: 360, encodedFrameRate: 30, bitrate: 800000 },
    ] as VideoLayerStats[];

    expect(readHighestLayerResolution(layers)).toEqual({ width: 640, height: 360 });
  });

  it('returns null when no layer has encoded a frame yet', () => {
    const layers = [
      { encodedFrameRate: 0, bitrate: 0 },
      { encodedFrameRate: 0 },
    ] as VideoLayerStats[];

    expect(readHighestLayerResolution(layers)).toBeNull();
  });
});
