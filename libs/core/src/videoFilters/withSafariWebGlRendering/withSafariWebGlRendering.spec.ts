import { describe, expect, it, vi, beforeEach } from 'vitest';
import { isWebKit } from '@web/platform';
import withSafariWebGlRendering from './withSafariWebGlRendering';

vi.mock('@web/platform', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@web/platform')>()),
  isWebKit: vi.fn(),
}));

describe('withSafariWebGlRendering', () => {
  beforeEach(() => {
    vi.mocked(isWebKit).mockReturnValue(false);
  });

  it('pins background replacement to WebGL on Safari, and leaves everything else alone', () => {
    const replacement = { type: 'backgroundReplacement', backgroundImgUrl: 'room.jpg' } as const;
    const blur = { type: 'backgroundBlur', blurStrength: 'high' } as const;

    expect(withSafariWebGlRendering(replacement)).toBe(replacement);
    expect(withSafariWebGlRendering(blur)).toBe(blur);
    expect(withSafariWebGlRendering(undefined)).toBeUndefined();

    vi.mocked(isWebKit).mockReturnValue(true);

    expect(withSafariWebGlRendering(replacement)).toEqual({
      ...replacement,
      renderingOptions: { type: 'WEBGL' },
    });
    expect(withSafariWebGlRendering(blur)).toBe(blur);
    expect(withSafariWebGlRendering(undefined)).toBeUndefined();
  });
});
