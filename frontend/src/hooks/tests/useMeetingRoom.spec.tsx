import { waitFor, renderHook as renderHookBase } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useMeetingRoom from '../useMeetingRoom';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';
import { MemoryRouter } from 'react-router-dom';
import { DEVICE_ACCESS_STATUS } from '@utils/constants';
import { env } from '../../env';
import type { VideoClient } from '@core/services';
import frontendLogger from '../../logger';

const mockSessionId = '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE';
const validSessionKey =
  'eyJhbGciOiJIUzI1NiJ9.eyJzZXNzaW9uSWQiOiIxX01YNHhNak0wTlRZM09INC1WR2gxSUVabFlpQXlOeUF3T0Rvek1qb3pOQ0JRVTFRZ01qQXlNSDR3TGpJME5EWXhNakUiLCJyb29tTmFtZSI6IlRlc3RDb21wb25lbnRSb29tIn0.fakesig';

const { mockCreateSessionMutate, mockJoinSessionMutate, mockVideoClient } = vi.hoisted(() => {
  const mockCreateSessionMutate = vi.fn();
  const mockJoinSessionMutate = vi.fn();
  const mockVideoClient = {
    createSession: (...args: unknown[]) => mockCreateSessionMutate(...args) as unknown,
    joinSession: (...args: unknown[]) => mockJoinSessionMutate(...args) as unknown,
  };
  return { mockCreateSessionMutate, mockJoinSessionMutate, mockVideoClient };
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

vi.mock('../useBackgroundPublisherContext', () => ({
  default: () => ({
    initBackgroundLocalPublisher: vi.fn(),
    publisher: null,
    accessStatus: DEVICE_ACCESS_STATUS.ACCEPTED,
  }),
}));

describe('useMeetingRoom', () => {
  beforeEach(() => {
    mockLocation.search = '';
    env.BYPASS_WAITING_ROOM = false;
    mockCreateSessionMutate.mockResolvedValue({ sessionKey: validSessionKey });
    mockJoinSessionMutate.mockResolvedValue({ token: 'mock-token', sessionId: mockSessionId });
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

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/goodbye/test-room',
        expect.objectContaining({
          state: expect.objectContaining({
            header: 'Publisher error',
            caption: 'Could not publish',
          }),
        })
      );
    });
  });

  it('reports and redirects to goodbye (does not throw) when resolving the session before joining fails', async () => {
    expect.assertions(2);
    const reportErrorSpy = vi.spyOn(frontendLogger, 'reportError').mockImplementation(() => {});
    const joinFailure = new Error('create session failed');
    mockCreateSessionMutate.mockRejectedValue(joinFailure);

    renderHook(() => useMeetingRoom());

    await waitFor(() => {
      if (reportErrorSpy.mock.calls.length === 0) {
        throw new Error('reportError not called yet');
      }
    });
    expect(reportErrorSpy).toHaveBeenCalledWith(
      joinFailure,
      expect.objectContaining({
        eventSource: 'useMeetingRoom.resolveAndJoin.error',
        sessionKey: 'test-room',
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      '/goodbye/test-room',
      expect.objectContaining({
        state: expect.objectContaining({
          header: expect.any(String),
          caption: expect.any(String),
        }),
      })
    );
  });

  it('reports and redirects to goodbye (does not throw) when connect() itself rejects', async () => {
    expect.assertions(2);
    const reportErrorSpy = vi.spyOn(frontendLogger, 'reportError').mockImplementation(() => {});
    const connectFailure = new Error('connect failed');
    const mockJoinRoom = vi.fn().mockRejectedValue(connectFailure);

    renderHook(() => useMeetingRoom(), {
      sessionContext: {
        __interceptor: (ctx) => {
          if (ctx) ctx.joinRoom = mockJoinRoom;
        },
      },
    });

    await waitFor(() => {
      if (reportErrorSpy.mock.calls.length === 0) {
        throw new Error('reportError not called yet');
      }
    });
    expect(reportErrorSpy).toHaveBeenCalledWith(
      connectFailure,
      expect.objectContaining({
        eventSource: 'useMeetingRoom.resolveAndJoin.error',
        sessionKey: 'test-room',
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      '/goodbye/test-room',
      expect.objectContaining({
        state: expect.objectContaining({
          header: expect.any(String),
          caption: expect.any(String),
        }),
      })
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

    await new Promise((r) => setTimeout(r, 50));
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
    [
      providers.user,
      providers.session,
      providers.publisher,
      providers.runtime,
      providers.screenShare,
    ],
    {
      userContext: {
        value: { defaultSettings: { name: 'Test User' } },
        ...userContext,
      },
      sessionContext,
      publisherContext,
      runtimeContext: { videoClient: mockVideoClient as VideoClient },
      screenShareContext: undefined,
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
