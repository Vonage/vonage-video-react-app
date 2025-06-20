import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import useCollectBrowserInformation from '../useCollectBrowserInformation';
import useSessionContext from '../useSessionContext';

vi.mock('../useSessionContext', () => ({
  default: vi.fn(),
}));

describe('useCollectBrowserInformation', () => {
  beforeEach(() => {
    (useSessionContext as Mock).mockReturnValue({
      vonageVideoClient: {
        sessionId: 'someSessionId',
        connectionId: 'yourConnectionId',
      },
    });

    // Mock navigator properties
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('FakeUserAgent');
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    vi.spyOn(navigator, 'cookieEnabled', 'get').mockReturnValue(true);

    // Mock window properties
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1920);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080);
    vi.spyOn(window.screen, 'width', 'get').mockReturnValue(2560);
    vi.spyOn(window.screen, 'height', 'get').mockReturnValue(1440);

    // Mock window.location with all required properties
    const fakeUrl = { href: 'https://awesome-website.com' };
    vi.spyOn(window, 'location', 'get').mockReturnValue(fakeUrl as unknown as Location);

    // Mock document properties
    vi.spyOn(document, 'referrer', 'get').mockReturnValue('https://awesome-referrer.com');

    // Mock the date format
    vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
      timeZone: 'America/Chicago',
      locale: 'en-US',
      calendar: 'gregory',
      numberingSystem: 'latn',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should collect all browser information correctly', () => {
    const result = useCollectBrowserInformation();

    expect(result).toEqual({
      sessionId: 'someSessionId',
      browser: 'FakeUserAgent',
      screenResolution: '2560x1440',
      referrer: 'https://awesome-referrer.com',
      currentUrl: 'https://awesome-website.com',
      timeZone: 'America/Chicago',
      language: 'en-US',
      isOnline: true,
      cookiesEnabled: true,
      windowSize: {
        width: 1920,
        height: 1080,
      },
      connectionId: 'yourConnectionId',
    });
  });
});
