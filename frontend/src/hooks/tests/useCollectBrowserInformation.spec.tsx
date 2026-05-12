import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook as renderHookBase } from '@testing-library/react';
import useCollectBrowserInformation from '../useCollectBrowserInformation';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import EventEmitter from 'events';
import type VonageVideoClient from '@utils/VonageVideoClient';

describe('useCollectBrowserInformation', () => {
  beforeEach(() => {
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
    const mockVonageVideoClient = Object.assign(new EventEmitter(), {
      get sessionId() {
        return 'someSessionId';
      },
      get connectionId() {
        return 'yourConnectionId';
      },
    }) as VonageVideoClient;

    const { result } = render({
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.vonageVideoClient = mockVonageVideoClient;
          }
        },
      },
    });

    expect(result.current).toEqual({
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

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
};

function render({ sessionContext, userContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider(
    [providers.user, providers.session, providers.runtime],
    {
      sessionContext,
      userContext,
      runtimeContext: undefined,
    }
  );

  return {
    ...context,
    ...renderHookBase(() => useCollectBrowserInformation(), {
      wrapper,
    }),
  };
}
