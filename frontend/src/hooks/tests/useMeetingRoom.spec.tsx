import { waitFor, renderHook as renderHookBase } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import useMeetingRoom from '../useMeetingRoom';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';
import MemoryRouter from '@test/RouterWrapper';
import { DEVICE_ACCESS_STATUS } from '@utils/constants';
import { env } from '../../env';
import useSessionContext from '../useSessionContext';
import usePublisherContext from '../usePublisherContext';
import useUserContext from '../useUserContext';

const mockNavigate = vi.fn();
const mockLocation = { search: '' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

vi.mock('../useRoomName', () => ({
  default: () => 'test-room',
}));

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

vi.mock('../useSessionContext');
vi.mock('../usePublisherContext');
vi.mock('../useUserContext');

const mockJoinRoom = vi.fn();
const mockDisconnect = vi.fn();
const mockUseSessionContext = useSessionContext as Mock;
const mockUsePublisherContext = usePublisherContext as Mock;
const mockUseUserContext = useUserContext as Mock;

const mockInitializeLocalPublisher = vi.fn();
const mockPublish = vi.fn();
const mockInitBackgroundLocalPublisher = vi.fn();

vi.mock('../useBackgroundPublisherContext', () => ({
  default: () => ({
    initBackgroundLocalPublisher: mockInitBackgroundLocalPublisher,
    publisher: null,
    accessStatus: DEVICE_ACCESS_STATUS.ACCEPTED,
  }),
}));

const defaultSessionContext = {
  joinRoom: mockJoinRoom,
  subscriptionError: null,
  subscriberWrappers: [],
  connected: true,
  disconnect: mockDisconnect,
  reconnecting: false,
  rightPanelActiveTab: null,
  toggleChat: vi.fn(),
  toggleParticipantList: vi.fn(),
  toggleBackgroundEffects: vi.fn(),
  closeRightPanel: vi.fn(),
  toggleReportIssue: vi.fn(),
  archiveId: null,
};

const defaultPublisherContext = {
  publisher: null,
  publish: mockPublish,
  quality: null,
  initializeLocalPublisher: mockInitializeLocalPublisher,
  publishingError: null,
  isVideoEnabled: true,
  publisherOptions: { audioSource: true, videoSource: true },
};

const defaultUserContext = {
  user: {
    defaultSettings: { name: 'Test User' },
  },
};

describe('useMeetingRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.search = '';
    env.BYPASS_WAITING_ROOM = false;
    mockUseSessionContext.mockReturnValue({ ...defaultSessionContext });
    mockUsePublisherContext.mockReturnValue({ ...defaultPublisherContext });
    mockUseUserContext.mockReturnValue({ ...defaultUserContext });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns all expected fields', async () => {
    const { result } = renderHook(() => useMeetingRoom());

    await waitFor(() => {
      expect(result.current).toMatchObject({
        isSmallViewport: false,
        isSharingScreen: false,
        subscriberWrappers: [],
        reconnecting: false,
        isRecording: false,
        isVideoEnabled: true,
      });
    });
  });

  it('isRecording is true when archiveId is set', async () => {
    mockUseSessionContext.mockReturnValue({ ...defaultSessionContext, archiveId: 'archive-123' });

    const { result } = renderHook(() => useMeetingRoom());
    await waitFor(() => {
      expect(result.current.isRecording).toBe(true);
    });
  });

  it('navigates to waiting room when username is missing and bypass is false', async () => {
    mockUseUserContext.mockReturnValue({ user: { defaultSettings: { name: '' } } });

    renderHook(() => useMeetingRoom());

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/waiting-room/test-room');
    });
  });

  it('does not navigate to waiting room when bypass is true', async () => {
    mockLocation.search = '?bypass=true';
    mockUseUserContext.mockReturnValue({ user: { defaultSettings: { name: '' } } });

    renderHook(() => useMeetingRoom());

    await waitFor(() => {
      expect(mockJoinRoom).toHaveBeenCalledWith('test-room');
    });
    expect(mockNavigate).not.toHaveBeenCalledWith('/waiting-room/test-room');
  });

  it('navigates to goodbye when publishingError is set and user is online', async () => {
    mockUsePublisherContext.mockReturnValue({
      ...defaultPublisherContext,
      publishingError: { header: 'Publisher error', caption: 'Could not publish' },
      publisherOptions: null,
    });

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

    renderHook(() => useMeetingRoom());

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/goodbye',
        expect.objectContaining({
          state: expect.objectContaining({
            header: 'Publisher error',
            caption: 'Could not publish',
          }),
        })
      );
    });
  });

  it('does not navigate to goodbye when reconnecting is true', async () => {
    mockUsePublisherContext.mockReturnValue({
      ...defaultPublisherContext,
      publishingError: { header: 'err', caption: 'desc' },
      publisherOptions: null,
    });

    mockUseSessionContext.mockReturnValue({ ...defaultSessionContext, reconnecting: true });

    renderHook(() => useMeetingRoom());

    await new Promise((r) => setTimeout(r, 50));
    expect(mockNavigate).not.toHaveBeenCalledWith('/goodbye', expect.anything());
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
};

function renderHook<Result>(render: () => Result, { userContext }: RenderOptions = {}) {
  const { wrapper: ProvidersWrapper, ...context } = makeTestProvider([providers.user], {
    userContext,
  });

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
