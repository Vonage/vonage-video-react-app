import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook as renderHookBase, act } from '@testing-library/react';
import { Publisher, initPublisher } from '@vonage/client-sdk-video';
import useScreenShare from '../useScreenShare';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import EventEmitter from 'events';
import type VonageVideoClient from '../../utils/VonageVideoClient';
import { type UserContextType } from '../../Context/user';

// Mocking dependencies
vi.mock('@vonage/client-sdk-video', () => ({
  initPublisher: vi.fn(),
}));

describe('useScreenSharing', () => {
  let mockVonageVideoClient: Partial<VonageVideoClient>;
  let mockPublisher: Partial<Publisher>;
  const mockPublish = vi.fn();
  const mockUnpublish = vi.fn();
  const mockSetVideoContentHint = vi.fn();

  beforeEach(() => {
    mockVonageVideoClient = Object.assign(new EventEmitter(), {
      on: vi.fn(),
    }) as unknown as Partial<VonageVideoClient> as VonageVideoClient;

    mockPublisher = {
      on: vi.fn(),
      destroy: vi.fn(),
      setVideoContentHint: mockSetVideoContentHint,
    } as unknown as Partial<Publisher>;

    (initPublisher as ReturnType<typeof vi.fn>).mockReturnValue(mockPublisher as Publisher);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes screen sharing publisher and publishes with default (empty) content hint', async () => {
    const { result } = render({
      userContext: {
        __interceptor: (context: UserContextType | null) => {
          context!.user.defaultSettings.name = 'TestUser';
        },
      },
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.vonageVideoClient = mockVonageVideoClient as unknown as VonageVideoClient;
            context.publish = mockPublish;
            context.unpublish = mockUnpublish;
          }
        },
      },
    });

    await act(async () => {
      // toggling screen share on (default hint = '')
      await result.current.toggleShareScreen();
    });

    expect(initPublisher).toHaveBeenCalledWith(
      undefined,
      {
        videoSource: 'screen',
        insertDefaultUI: false,
        videoContentHint: '',
        name: "TestUser's screen",
      },
      expect.any(Function)
    );
    expect(mockPublisher.on).toHaveBeenCalledWith('streamCreated', expect.any(Function));
    expect(mockPublisher.on).toHaveBeenCalledWith('streamDestroyed', expect.any(Function));
    expect(mockPublisher.on).toHaveBeenCalledWith('mediaStopped', expect.any(Function));
  });

  it('initializes screen sharing publisher with the specified content hint', async () => {
    const { result } = render({
      userContext: {
        __interceptor: (context: UserContextType | null) => {
          context!.user.defaultSettings.name = 'TestUser';
        },
      },
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.vonageVideoClient = mockVonageVideoClient as unknown as VonageVideoClient;
            context.publish = mockPublish;
            context.unpublish = mockUnpublish;
          }
        },
      },
    });

    await act(async () => {
      await result.current.toggleShareScreen('motion');
    });

    expect(initPublisher).toHaveBeenCalledWith(
      undefined,
      {
        videoSource: 'screen',
        insertDefaultUI: false,
        videoContentHint: 'motion',
        name: "TestUser's screen",
      },
      expect.any(Function)
    );
  });

  it('unpublishes screen sharing when already sharing', async () => {
    const { result } = render({
      userContext: {
        __interceptor: (context: UserContextType | null) => {
          context!.user.defaultSettings.name = 'TestUser';
        },
      },
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.vonageVideoClient = mockVonageVideoClient as unknown as VonageVideoClient;
            context.publish = mockPublish;
            context.unpublish = mockUnpublish;
          }
        },
      },
    });

    await act(async () => {
      // toggling screen share on
      await result.current.toggleShareScreen();
      // toggling screen share off
      await result.current.toggleShareScreen();
    });

    expect(result.current.isSharingScreen).toBe(false);
  });

  it('does not initialize publisher if session is null', async () => {
    const { result } = render({
      userContext: {
        __interceptor: (context: UserContextType | null) => {
          context!.user.defaultSettings.name = 'TestUser';
        },
      },
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.vonageVideoClient = null;
            context.publish = mockPublish;
            context.unpublish = mockUnpublish;
          }
        },
      },
    });

    await act(async () => {
      await result.current.toggleShareScreen();
    });

    expect(initPublisher).not.toHaveBeenCalled();
  });

  it('calls publisher.setVideoContentHint when changeContentHint is invoked', async () => {
    const { result } = render({
      userContext: {
        __interceptor: (context: UserContextType | null) => {
          context!.user.defaultSettings.name = 'TestUser';
        },
      },
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.vonageVideoClient = mockVonageVideoClient as unknown as VonageVideoClient;
            context.publish = mockPublish;
            context.unpublish = mockUnpublish;
          }
        },
      },
    });

    // Start sharing so the publisher ref is populated
    await act(async () => {
      await result.current.toggleShareScreen();
    });

    act(() => {
      result.current.changeContentHint('text');
    });

    expect(mockSetVideoContentHint).toHaveBeenCalledWith('text');
  });

  it('updates currentContentHint when changeContentHint is invoked', async () => {
    const { result } = render({
      userContext: {
        __interceptor: (context: UserContextType | null) => {
          context!.user.defaultSettings.name = 'TestUser';
        },
      },
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.vonageVideoClient = mockVonageVideoClient as unknown as VonageVideoClient;
            context.publish = mockPublish;
            context.unpublish = mockUnpublish;
          }
        },
      },
    });

    expect(result.current.currentContentHint).toBe('');

    // Start sharing so the publisher ref is populated
    await act(async () => {
      await result.current.toggleShareScreen();
    });

    act(() => {
      result.current.changeContentHint('detail');
    });

    expect(result.current.currentContentHint).toBe('detail');
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
};

function render({ userContext, sessionContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.user, providers.session], {
    userContext,
    sessionContext,
  });

  return {
    ...context,
    ...renderHookBase(() => useScreenShare(), {
      wrapper,
    }),
  };
}
