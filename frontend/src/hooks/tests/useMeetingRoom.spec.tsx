import { waitFor, renderHook as renderHookBase } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useMeetingRoom from '../useMeetingRoom';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';
import { MemoryRouter } from 'react-router-dom';
import { DEVICE_ACCESS_STATUS } from '@utils/constants';
import { env } from '../../env';
import type { VideoClient } from '@core/services';
import type { PublishingErrorType } from '../../Context/PublisherProvider/usePublisher/usePublisher';

const mockSessionId = '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE';
const validSessionKey =
  'eyJhbGciOiJIUzI1NiJ9.eyJzZXNzaW9uSWQiOiIxX01YNHhNak0wTlRZM09INC1WR2gxSUVabFlpQXlOeUF3T0Rvek1qb3pOQ0JRVTFRZ01qQXlNSDR3TGpJME5EWXhNakUiLCJyb29tTmFtZSI6IlRlc3RDb21wb25lbnRSb29tIn0.fakesig';

const {
  mockCreateSessionMutate,
  mockJoinSessionMutate,
  mockVideoClient,
  mockBackgroundAccess,
  mockInitBackgroundPublisher,
} = vi.hoisted(() => {
  const mockCreateSessionMutate = vi.fn();
  const mockJoinSessionMutate = vi.fn();
  const mockVideoClient = {
    createSession: (...args: unknown[]) => mockCreateSessionMutate(...args) as unknown,
    joinSession: (...args: unknown[]) => mockJoinSessionMutate(...args) as unknown,
  };
  // Mutable so individual tests can drive the background publisher's accessStatus.
  const mockBackgroundAccess = { status: 'accepted' };
  const mockInitBackgroundPublisher = vi.fn();
  return {
    mockCreateSessionMutate,
    mockJoinSessionMutate,
    mockVideoClient,
    mockBackgroundAccess,
    mockInitBackgroundPublisher,
  };
});

const mockNavigate = vi.fn();
const mockLocation = { search: '' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    useParams: () => ({ roomIdentifier: 'test-room' }),
  };
});

vi.mock('../useIsSmallViewport', () => ({
  default: () => false,
}));

vi.mock('../useScreenShare', () => ({
  default: () => ({
    isSharingScreen: false,
    screensharingPublisher: null,
    screenshareVideoElement: null,
    toggleShareScreen: vi.fn(),
  }),
}));

vi.mock('../useBackgroundPublisherContext', () => ({
  default: () => ({
    initBackgroundLocalPublisher: mockInitBackgroundPublisher,
    publisher: null,
    accessStatus: mockBackgroundAccess.status,
  }),
}));

describe('useMeetingRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.search = '';
    env.BYPASS_WAITING_ROOM = false;
    mockBackgroundAccess.status = DEVICE_ACCESS_STATUS.ACCEPTED;
    mockCreateSessionMutate.mockResolvedValue({ sessionKey: validSessionKey });
    mockJoinSessionMutate.mockResolvedValue({ token: 'mock-token', sessionId: mockSessionId });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('mid-call permission changes keep the user in the call (Google Meet style)', () => {
    it('recovers the background publisher in place on re-grant (ACCESS_CHANGED) without reloading or leaving', async () => {
      const reload = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { ...window.location, reload },
        configurable: true,
      });
      mockBackgroundAccess.status = DEVICE_ACCESS_STATUS.ACCESS_CHANGED;

      renderHook(() => useMeetingRoom());

      // The background publisher re-initializes in place — no page reload, no exit to the waiting room.
      await waitFor(() => expect(mockInitBackgroundPublisher).toHaveBeenCalled());
      expect(reload).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalledWith('/waiting-room/test-room');
    });

    it('does not re-initialize the background publisher while a device is blocked (REJECTED)', async () => {
      const reload = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { ...window.location, reload },
        configurable: true,
      });
      mockBackgroundAccess.status = DEVICE_ACCESS_STATUS.REJECTED;

      renderHook(() => useMeetingRoom());

      // Retrying getUserMedia while blocked would loop; the gate stays closed and the user stays put.
      await new Promise((r) => setTimeout(r, 50));
      expect(mockInitBackgroundPublisher).not.toHaveBeenCalled();
      expect(reload).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalledWith('/waiting-room/test-room');
    });
  });

  it('returns all expected fields', async () => {
    const { result } = renderHook(() => useMeetingRoom());

    await waitFor(() => {
      expect(result.current).toMatchObject({
        isSharingScreen: false,
        subscriberWrappers: [],
        reconnecting: false,
        isRecording: false,
        isVideoEnabled: true,
      });
    });
  });

  it('isRecording is true when archiveId is set', async () => {
    const { result } = renderHook(() => useMeetingRoom(), {
      sessionContext: { initialValue: { archiveId: 'archive-123' } },
    });

    await waitFor(() => {
      expect(result.current.isRecording).toBe(true);
    });
  });

  it('navigates to waiting room when username is missing and bypass is false', async () => {
    renderHook(() => useMeetingRoom(), {
      userContext: { value: { defaultSettings: { name: '' } } },
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/waiting-room/test-room');
    });
  });

  it('does not navigate to waiting room when bypass is true', async () => {
    mockLocation.search = '?bypass=true';
    const mockJoinRoom = vi.fn();

    renderHook(() => useMeetingRoom(), {
      userContext: { value: { defaultSettings: { name: '' } } },
      sessionContext: {
        __interceptor: (ctx) => {
          if (ctx) ctx.joinRoom = mockJoinRoom;
        },
      },
    });

    await waitFor(() => {
      expect(mockJoinRoom).toHaveBeenCalledWith({ sessionKey: validSessionKey });
    });
    expect(mockNavigate).not.toHaveBeenCalledWith('/waiting-room/test-room');
  });

  it('navigates to goodbye when publishingError is set and user is online', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

    renderHook(() => useMeetingRoom(), {
      publisherContext: {
        initialValue: {
          publishingError: { header: 'Publisher error', caption: 'Could not publish' },
        },
      },
    });

    // The ejection is deferred by a grace period, so allow more time than the default.
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/goodbye/test-room',
          expect.objectContaining({
            state: expect.objectContaining({
              header: 'Publisher error',
              caption: 'Could not publish',
            }),
          })
        );
      },
      { timeout: 3000 }
    );
  });

  it('does not navigate to goodbye when reconnecting is true', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

    renderHook(() => useMeetingRoom(), {
      publisherContext: {
        initialValue: {
          publishingError: { header: 'err', caption: 'desc' },
        },
      },
      sessionContext: { initialValue: { reconnecting: true } },
    });

    // Wait past the redirect grace period to be sure it never fires.
    await new Promise((r) => setTimeout(r, 2000));
    expect(mockNavigate).not.toHaveBeenCalledWith('/goodbye/test-room', expect.anything());
  });

  it('does not navigate to goodbye when publishing fails while a device is blocked', async () => {
    // Google Meet style: a blocked camera/mic makes publishing fail, but that's recoverable in
    // place, so the user must not be ejected to the goodbye page.
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

    renderHook(() => useMeetingRoom(), {
      publisherContext: {
        initialValue: {
          publishingError: { header: 'blocked', caption: 'trouble connecting' },
        },
        __interceptor: (ctx) => {
          if (ctx) ctx.deniedDevices = { microphone: true, camera: false };
        },
      },
    });

    // Wait past the redirect grace period to be sure the block suppresses the redirect entirely.
    await new Promise((r) => setTimeout(r, 2000));
    expect(mockNavigate).not.toHaveBeenCalledWith('/goodbye/test-room', expect.anything());
  });

  it('does not eject when a transient publishing error clears within the grace period', async () => {
    // A device revoked then re-granted mid-call briefly fails publishing before the track
    // re-publishes. That transient error must not eject the user before it clears.
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const state: { error: PublishingErrorType } = {
      error: { header: 'blocked', caption: 'trouble connecting' },
    };

    const { rerender } = renderHook(() => useMeetingRoom(), {
      publisherContext: {
        __interceptor: (ctx) => {
          if (ctx) ctx.publishingError = state.error;
        },
      },
    });

    // Clear the error well before the grace period elapses, as a successful re-publish would.
    await new Promise((r) => setTimeout(r, 200));
    state.error = null;
    rerender();

    await new Promise((r) => setTimeout(r, 2000));
    expect(mockNavigate).not.toHaveBeenCalledWith('/goodbye/test-room', expect.anything());
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
  publisherContext?: ProviderOptions['PublisherContext'];
};

function renderHook<Result>(
  render: () => Result,
  { userContext, sessionContext, publisherContext }: RenderOptions = {}
) {
  const { wrapper: ProvidersWrapper, ...context } = makeTestProvider(
    [providers.user, providers.session, providers.publisher, providers.runtime],
    {
      userContext: {
        value: { defaultSettings: { name: 'Test User' } },
        ...userContext,
      },
      sessionContext,
      publisherContext,
      runtimeContext: { videoClient: mockVideoClient as unknown as VideoClient },
    }
  );

  const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={['/meeting-room/test-room']}>
      <ProvidersWrapper>{children}</ProvidersWrapper>
    </MemoryRouter>
  );

  return {
    ...context,
    ...renderHookBase(render, { wrapper: RouterWrapper }),
  };
}
