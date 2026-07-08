import { describe, it, expect, vi, afterEach } from 'vitest';
import createImageThumbnail from './createImageThumbnail';

const originalImage = global.Image;

afterEach(() => {
  vi.restoreAllMocks();
  global.Image = originalImage;
});

/**
 * Replaces the global Image with a stub that resolves onload/onerror on the next microtask,
 * since jsdom does not actually decode data URLs.
 */
function stubImage({
  width,
  height,
  fail = false,
}: {
  width: number;
  height: number;
  fail?: boolean;
}) {
  class FakeImage {
    onload: (() => void) | null = null;

    onerror: (() => void) | null = null;

    width = width;

    height = height;

    set src(_value: string) {
      queueMicrotask(() => (fail ? this.onerror?.() : this.onload?.()));
    }
  }

  global.Image = FakeImage as unknown as typeof Image;
}

describe('createImageThumbnail', () => {
  it('returns the original data URL when no canvas 2d context is available', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const source = 'data:image/png;base64,original';

    await expect(createImageThumbnail(source)).resolves.toBe(source);
  });

  it('downscales a large image to the max dimension, preserving aspect ratio', async () => {
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage,
    } as unknown as CanvasRenderingContext2D);
    const toDataURL = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/jpeg;base64,thumb');
    stubImage({ width: 1600, height: 900 });

    const result = await createImageThumbnail('data:image/png;base64,original');

    expect(result).toBe('data:image/jpeg;base64,thumb');
    // 1600x900 clamped so the longest side is 400 -> 400x225 (aspect preserved).
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 400, 225);
    expect(toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
  });

  it('does not upscale images already smaller than the max dimension', async () => {
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/jpeg;base64,thumb'
    );
    stubImage({ width: 120, height: 80 });

    await createImageThumbnail('data:image/png;base64,original');

    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 120, 80);
  });

  it('returns the original data URL when the image fails to decode', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    stubImage({ width: 10, height: 10, fail: true });
    const source = 'data:image/png;base64,broken';

    await expect(createImageThumbnail(source)).resolves.toBe(source);
  });
});
