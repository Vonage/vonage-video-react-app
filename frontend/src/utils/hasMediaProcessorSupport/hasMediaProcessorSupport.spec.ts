import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { hasMediaProcessorSupport as hasSdkMediaProcessorSupport } from '@vonage/client-sdk-video';
import hasMediaProcessorSupport from './hasMediaProcessorSupport';

vi.mock('@vonage/client-sdk-video');

const originalUserAgent = navigator.userAgent;
const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const FIREFOX_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:148.0) Gecko/20100101 Firefox/148.0';
const SAFARI_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';

describe('hasMediaProcessorSupport', () => {
  beforeEach(() => {
    vi.mocked(hasSdkMediaProcessorSupport).mockReturnValue(true);
  });

  afterEach(() => {
    setUserAgent(originalUserAgent);
  });

  it('delegates to the SDK on supported browsers', () => {
    setUserAgent(CHROME_UA);

    expect(hasMediaProcessorSupport('video')).toBe(true);

    vi.mocked(hasSdkMediaProcessorSupport).mockReturnValue(false);

    expect(hasMediaProcessorSupport('audio')).toBe(false);
  });

  it.each([
    ['Firefox', FIREFOX_UA],
    ['Safari', SAFARI_UA],
  ])('returns false on %s even when the SDK reports support', (_browser, userAgent) => {
    setUserAgent(userAgent);

    expect(hasMediaProcessorSupport('video')).toBe(false);
    expect(hasMediaProcessorSupport('audio')).toBe(false);
  });
});

function setUserAgent(userAgent: string) {
  Object.defineProperty(navigator, 'userAgent', { configurable: true, value: userAgent });
}
