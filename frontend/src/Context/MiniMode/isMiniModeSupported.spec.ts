import { afterEach, describe, expect, it, vi } from 'vitest';
import { env } from '../../env';
import isMiniModeSupported from './isMiniModeSupported';

const ANDROID_CHROME_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';
const DESKTOP_FIREFOX_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.0; rv:151.0) Gecko/20100101 Firefox/151.0';

describe('isMiniModeSupported', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('is supported only on desktop browsers with Document Picture-in-Picture and the flag on', () => {
    expect(isMiniModeSupported()).toBe(false);

    vi.stubGlobal('documentPictureInPicture', { requestWindow: vi.fn() });
    expect(isMiniModeSupported()).toBe(true);

    env.partialUpdate({ ALLOW_MINI_MODE: false });
    expect(isMiniModeSupported()).toBe(false);

    env.partialUpdate({ ALLOW_MINI_MODE: true });
    const userAgentSpy = vi.spyOn(navigator, 'userAgent', 'get');
    userAgentSpy.mockReturnValue(ANDROID_CHROME_USER_AGENT);
    expect(isMiniModeSupported()).toBe(false);

    userAgentSpy.mockReturnValue(DESKTOP_FIREFOX_USER_AGENT);
    expect(isMiniModeSupported()).toBe(true);
  });
});
