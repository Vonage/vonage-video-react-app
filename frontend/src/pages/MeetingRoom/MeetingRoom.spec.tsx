import '../../css/index.css';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { render as renderBase, RenderOptions, screen } from '@testing-library/react';
import { Publisher, Subscriber } from '@vonage/client-sdk-video';
import { EventEmitter } from 'stream';
import * as mui from '@mui/material';
import AppConfigStore from '@Context/ConfigProvider/AppConfigStore';
import { ConfigProviderBase } from '@Context/ConfigProvider/ConfigProvider';
import { ReactElement, FC, PropsWithChildren } from 'react';
import MeetingRoom from './MeetingRoom';
import UserProvider, { UserContextType } from '../../Context/user';
import SessionProvider, { SessionContextType } from '../../Context/SessionProvider/session';
import { SubscriberWrapper } from '../../types/session';
import { PublisherContextType, PublisherProvider } from '../../Context/PublisherProvider';
import usePublisherContext from '../../hooks/usePublisherContext';
import useUserContext from '../../hooks/useUserContext';
import useDevices from '../../hooks/useDevices';
import { AllMediaDevices } from '../../types';
import { allMediaDevices, defaultAudioDevice } from '../../utils/mockData/device';
import useSpeakingDetector from '../../hooks/useSpeakingDetector';
import useLayoutManager, { GetLayout } from '../../hooks/useLayoutManager';
import useSessionContext from '../../hooks/useSessionContext';
import useActiveSpeaker from '../../hooks/useActiveSpeaker';
import useScreenShare, { UseScreenShareType } from '../../hooks/useScreenShare';
import { RIGHT_PANEL_BUTTON_COUNT } from '../../utils/constants';
import useToolbarButtons, {
  UseToolbarButtons,
  UseToolbarButtonsProps,
} from '../../hooks/useToolbarButtons';
import usePublisherOptions from '../../Context/PublisherProvider/usePublisherOptions';

const mockedNavigate = vi.fn();
const mockedParams = { roomName: 'test-room-name' };
const mockedLocation = vi.fn();
vi.mock('../../hooks/useBackgroundPublisherContext', () => ({
  __esModule: true,
  default: () => ({
    initBackgroundLocalPublisher: vi.fn(),
    destroyBackgroundLocalPublisher: vi.fn(),
    backgroundPublisher: null,
    accessStatus: undefined,
  }),
}));
vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...mod,
    useNavigate: () => mockedNavigate,
    useParams: () => mockedParams,
    useLocation: () => mockedLocation,
  };
});
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof mui>('@mui/material');
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  };
});

vi.mock('../../hooks/useDevices.tsx');
vi.mock('../../hooks/usePublisherContext.tsx');
vi.mock('../../hooks/useUserContext.tsx');
vi.mock('../../hooks/useSpeakingDetector.tsx');
vi.mock('../../hooks/useLayoutManager.tsx');
vi.mock('../../hooks/useSessionContext.tsx');
vi.mock('../../hooks/useActiveSpeaker.tsx');
vi.mock('../../hooks/useScreenShare.tsx');
vi.mock('../../hooks/useToolbarButtons');
vi.mock('../../Context/PublisherProvider/usePublisherOptions');

const mockUseDevices = useDevices as Mock<
  [],
  { allMediaDevices: AllMediaDevices; getAllMediaDevices: () => void }
>;

const mockUsePublisherContext = usePublisherContext as Mock<[], PublisherContextType>;
const mockUseUserContext = useUserContext as Mock<[], UserContextType>;
const mockUserContext = {
  user: {
    defaultSettings: {
      videoFilter: undefined,
      name: 'John Doe',
    },
  },
} as unknown as UserContextType;
const mockUseSpeakingDetector = useSpeakingDetector as Mock<[], boolean>;
const mockUseLayoutManager = useLayoutManager as Mock<[], GetLayout>;
const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
const mockUseActiveSpeaker = useActiveSpeaker as Mock<[], string | undefined>;
const mockUseScreenShare = useScreenShare as Mock<[], UseScreenShareType>;
const mockUseToolbarButtons = useToolbarButtons as Mock<
  [UseToolbarButtonsProps],
  UseToolbarButtons
>;

const MeetingRoomWithProviders = () => (
  <UserProvider>
    <SessionProvider>
      <PublisherProvider>
        <MeetingRoom />
      </PublisherProvider>
    </SessionProvider>
  </UserProvider>
);

const createSubscriberWrapper = (id: string): SubscriberWrapper => {
  const mockSubscriber = {
    id,
    on: vi.fn(), // Mock the 'on' method using vitest's mock function
    off: vi.fn(), // Mock the 'off' method
    videoWidth: () => 1280,
    videoHeight: () => 720,
    subscribeToVideo: () => {},
    getVideoFilter: vi.fn(() => undefined),
    stream: {
      streamId: id,
    },
  } as unknown as Subscriber;
  return {
    id,
    element: document.createElement('video'),
    isScreenshare: false,
    isPinned: false,
    subscriber: mockSubscriber,
  };
};

describe('MeetingRoom', () => {
  let mockPublisher: Publisher;
  let sessionContext: SessionContextType;
  let publisherContext: PublisherContextType;

  beforeEach(() => {
    mockUseUserContext.mockImplementation(() => mockUserContext);
    mockPublisher = Object.assign(new EventEmitter(), {
      applyVideoFilter: vi.fn(),
      clearVideoFilter: vi.fn(),
      getAudioSource: () => defaultAudioDevice,
      videoWidth: () => 1280,
      videoHeight: () => 720,
      getVideoFilter: vi.fn(() => undefined),
    }) as unknown as Publisher;
    publisherContext = {
      publisher: null,
      isPublishing: true,
      publish: vi.fn() as () => Promise<void>,
      initializeLocalPublisher: vi.fn(() => {
        publisherContext.publisher = mockPublisher;
      }) as unknown as () => void,
    } as unknown as PublisherContextType;
    mockUsePublisherContext.mockImplementation(() => publisherContext);
    mockUseDevices.mockReturnValue({
      getAllMediaDevices: vi.fn(),
      allMediaDevices,
    });
    (usePublisherOptions as Mock).mockReturnValue({});

    sessionContext = {
      joinRoom: vi.fn(),
      subscriberWrappers: [],
      connected: false,
      reconnecting: false,
      layoutMode: 'grid',
      rightPanelActiveTab: 'closed',
      toggleChat: vi.fn(),
      toggleParticipantList: vi.fn(),
      closeRightPanel: vi.fn(),
      emojiQueue: [],
    } as unknown as SessionContextType;
    mockUseSpeakingDetector.mockReturnValue(false);
    mockUseLayoutManager.mockImplementation(() => (_dimensions, elements) => {
      return Array(elements.length).fill({
        height: 720,
        left: 0,
        top: 0,
        width: 1280,
      });
    });
    mockUseSessionContext.mockReturnValue(sessionContext as unknown as SessionContextType);
    mockUseActiveSpeaker.mockReturnValue(undefined);
    mockUseScreenShare.mockReturnValue({
      toggleShareScreen: () => Promise.resolve(),
      isSharingScreen: false,
      screenshareVideoElement: undefined,
      screensharingPublisher: null,
    });
    (mui.useMediaQuery as Mock).mockReturnValue(false);
    mockUseToolbarButtons.mockImplementation(
      ({ numberOfToolbarButtons }: UseToolbarButtonsProps) => {
        const renderedToolbarButtons: UseToolbarButtons = {
          displayTimeRoomName: true,
          centerButtonLimit: numberOfToolbarButtons - RIGHT_PANEL_BUTTON_COUNT,
          rightButtonLimit: numberOfToolbarButtons,
        };
        return renderedToolbarButtons;
      }
    );
  });

  it('should render', () => {
    render(<MeetingRoomWithProviders />);
    const meetingRoom = screen.getByTestId('meetingRoom');
    expect(meetingRoom).not.toBeNull();
  });

  it('renders the small viewport header bar if it is on a small tab or device', () => {
    (mui.useMediaQuery as Mock).mockReturnValue(true);
    render(<MeetingRoomWithProviders />);
    expect(screen.getByTestId('smallViewportHeader')).not.toBeNull();
  });

  it('does not render the small viewport header bar if it is on desktop', () => {
    // we do not need to mock the small port view value here given we already do it in beforeEach
    render(<MeetingRoomWithProviders />);
    expect(screen.queryByTestId('smallViewportHeader')).toBeNull();
  });

  it('should call joinRoom on render only once', () => {
    const { rerender } = render(<MeetingRoomWithProviders />);
    expect(sessionContext.joinRoom).toHaveBeenCalledWith('test-room-name');
    expect(sessionContext.joinRoom).toHaveBeenCalledTimes(1);
    rerender(<MeetingRoomWithProviders />);
    rerender(<MeetingRoomWithProviders />);
    rerender(<MeetingRoomWithProviders />);
    rerender(<MeetingRoomWithProviders />);
    expect(sessionContext.joinRoom).toHaveBeenCalledTimes(1);
  });

  it('should call publish after connected', () => {
    const { rerender } = render(<MeetingRoomWithProviders />);
    expect(sessionContext.joinRoom).toHaveBeenCalledWith('test-room-name');
    sessionContext.connected = true;
    rerender(<MeetingRoomWithProviders />);
    expect(publisherContext.initializeLocalPublisher).toHaveBeenCalledTimes(1);
    expect(publisherContext.publish).toHaveBeenCalledTimes(1);
  });

  it('should display publisher', () => {
    sessionContext.connected = true;
    publisherContext.publisher = mockPublisher;
    const { rerender } = render(<MeetingRoomWithProviders />);
    rerender(<MeetingRoomWithProviders />);
    expect(screen.getByTestId('publisher-container')).toBeInTheDocument();
  });

  it('should display spinner until session is connected', () => {
    sessionContext.connected = false;
    publisherContext.publisher = mockPublisher;
    const { rerender } = render(<MeetingRoomWithProviders />);
    rerender(<MeetingRoomWithProviders />);
    expect(screen.getByTestId('progress-spinner')).toBeInTheDocument();
    sessionContext.connected = true;
    rerender(<MeetingRoomWithProviders />);
    expect(screen.queryByTestId('progress-spinner')).not.toBeInTheDocument();
  });

  it('should hide subscribers and show participant hidden tile', () => {
    sessionContext.connected = true;
    sessionContext.layoutMode = 'active-speaker';
    sessionContext.subscriberWrappers = [
      createSubscriberWrapper('sub1'),
      createSubscriberWrapper('sub2'),
      createSubscriberWrapper('sub3'),
      createSubscriberWrapper('sub4'),
      createSubscriberWrapper('sub5'),
      createSubscriberWrapper('sub6'),
      createSubscriberWrapper('sub7'),
    ];
    publisherContext.publisher = mockPublisher;
    const { rerender } = render(<MeetingRoomWithProviders />);
    rerender(<MeetingRoomWithProviders />);
    expect(screen.getByTestId('subscriber-container-sub1')).toBeVisible();
    expect(screen.getByTestId('subscriber-container-sub2')).toBeVisible();
    expect(screen.getByTestId('subscriber-container-sub3')).toBeVisible();
    expect(screen.getByTestId('subscriber-container-sub4')).toBeVisible();
    expect(screen.getByTestId('hidden-participants')).toBeInTheDocument();
    expect(screen.getByTestId('subscriber-container-sub5')).not.toBeVisible();
    expect(screen.getByTestId('subscriber-container-sub6')).not.toBeVisible();
    expect(screen.getByTestId('subscriber-container-sub7')).not.toBeVisible();
  });

  it('should render subscribers in correct order', () => {
    sessionContext.connected = true;
    sessionContext.layoutMode = 'active-speaker';
    const [sub1, sub2, sub3] = Array(3)
      .fill(0)
      .map((_s, index) => createSubscriberWrapper(`sub${index + 1}`));
    sessionContext.subscriberWrappers = [sub1];
    publisherContext.publisher = mockPublisher;
    const { rerender } = render(<MeetingRoomWithProviders />);

    sessionContext.subscriberWrappers = [sub2, sub1];
    rerender(<MeetingRoomWithProviders />);

    const getSubIdsInRenderOrder = () =>
      screen.getAllByTestId('subscriber-container', { exact: false }).map((element) => element?.id);

    // sub1 joined first so should stay in position
    expect(getSubIdsInRenderOrder()).toEqual(['sub1', 'sub2']);

    sessionContext.subscriberWrappers = [sub3, sub2, sub1];
    rerender(<MeetingRoomWithProviders />);

    // sub1 and sub2 joined first so should stay in position ahead of sub3
    expect(getSubIdsInRenderOrder()).toEqual(['sub1', 'sub2', 'sub3']);
  });

  it('should display chat unread number', () => {
    sessionContext.connected = true;
    publisherContext.publisher = mockPublisher;
    const { rerender } = render(<MeetingRoomWithProviders />);
    rerender(<MeetingRoomWithProviders />);
    sessionContext.unreadCount = 4;
    rerender(<MeetingRoomWithProviders />);
    expect(screen.queryAllByTestId('chat-button-unread-count')[0]).toHaveTextContent('4');
  });

  describe('video quality problem alert', () => {
    it('should not be displayed when not publishing video', () => {
      publisherContext.isVideoEnabled = false;
      publisherContext.quality = 'poor';

      render(<MeetingRoomWithProviders />);

      const connectionAlert = screen.queryByText(
        'Please check your connectivity. Your video may be disabled to improve the user experience'
      );
      expect(connectionAlert).not.toBeInTheDocument();
    });

    it('should be displayed when publishing video', () => {
      publisherContext.isVideoEnabled = true;
      publisherContext.quality = 'poor';
      render(<MeetingRoomWithProviders />);

      const connectionAlert = screen.getByText(
        'Please check your connectivity. Your video may be disabled to improve the user experience'
      );
      expect(connectionAlert).toBeInTheDocument();
    });

    it('should be hidden when user stops publishing video', () => {
      publisherContext.isVideoEnabled = true;
      publisherContext.quality = 'poor';
      const { rerender } = render(<MeetingRoomWithProviders />);

      const connectionAlert = screen.queryByText(
        'Please check your connectivity. Your video may be disabled to improve the user experience'
      );
      expect(connectionAlert).toBeInTheDocument();

      publisherContext.isVideoEnabled = false;
      rerender(<MeetingRoomWithProviders />);
      expect(connectionAlert).not.toBeInTheDocument();
    });
  });

  it('should redirect user to goodbye page if unable to publish', () => {
    const publishingBlockedError = {
      header: 'Difficulties joining room',
      caption:
        "We're having trouble connecting you with others in the meeting room. Please check your network and try again.",
    };
    publisherContext.publishingError = publishingBlockedError;
    render(<MeetingRoomWithProviders />);

    expect(mockedNavigate).toHaveBeenCalledOnce();
    expect(mockedNavigate).toHaveBeenCalledWith('/goodbye', {
      state: {
        header: 'Difficulties joining room',
        roomName: 'test-room-name',
        caption:
          "We're having trouble connecting you with others in the meeting room. Please check your network and try again.",
      },
    });
  });
});

function render(ui: ReactElement, options?: RenderOptions) {
  const Wrapper = options?.wrapper ?? makeProvidersWrapper();
  return renderBase(ui, { ...options, wrapper: Wrapper });
}

function makeProvidersWrapper(providers?: { configStore?: AppConfigStore }) {
  const configStore =
    providers?.configStore ??
    new AppConfigStore({
      videoSettings: {
        allowCameraControl: true,
      },
      audioSettings: {
        allowMicrophoneControl: true,
      },
      meetingRoomSettings: {
        defaultLayoutMode: 'active-speaker',
        showParticipantList: true,
        allowChat: true,
        allowScreenShare: true,
        allowArchiving: true,
        allowCaptions: true,
        allowEmojis: true,
      },
    });

  const Wrapper: FC<PropsWithChildren> = ({ children }) => (
    <ConfigProviderBase value={configStore}>{children}</ConfigProviderBase>
  );

  return Wrapper;
}
