import '../../css/index.css';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import { Publisher, Subscriber } from '@vonage/client-sdk-video';
import { EventEmitter } from 'node:stream';
import { ReactElement } from 'react';
import { SubscriberWrapper } from '@app-types/session';
import { defaultAudioDevice } from '@utils/mockData/device';
import useSpeakingDetector, { UseSpeakingDetectorOptions } from '@hooks/useSpeakingDetector';
import useLayoutManager, { GetLayout } from '@hooks/useLayoutManager';
import useActiveSpeaker from '@hooks/useActiveSpeaker';
import useScreenShare, { UseScreenShareType } from '@hooks/useScreenShare';
import { RIGHT_PANEL_BUTTON_COUNT } from '@utils/constants';
import useToolbarButtons, {
  UseToolbarButtons,
  UseToolbarButtonsProps,
} from '@hooks/useToolbarButtons';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import { render as renderBase } from '@testing-library/react';
import useMediaQuery from '@mui/material/useMediaQuery';
import MeetingRoom from './MeetingRoom';
import type { Box } from 'opentok-layout-js';
import { setupWindowNavigatorMock } from '@web-test/fixtures';

const mockedNavigate = vi.fn();
const mockedParams = { roomName: 'test-room-name' };
const mockedLocation = vi.fn<[], ReturnType<typeof import('react-router-dom').useLocation>>();

vi.mock('@hooks/useBackgroundPublisherContext', () => ({
  __esModule: true,
  default: () => ({
    initBackgroundLocalPublisher: vi.fn(),
    destroyBackgroundLocalPublisher: vi.fn(),
    backgroundPublisherContext: null,
    accessStatus: undefined,
  }),
}));

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...mod,
    useNavigate: () => mockedNavigate,
    useParams: () => mockedParams,
    useLocation: () => mockedLocation(),
  };
});

vi.mock('@mui/material/useMediaQuery', () => ({
  default: vi.fn(),
}));

// vi.mock('../../env', () => ({
//   default: {
//     BYPASS_WAITING_ROOM: false,
//   },
// }));

vi.mock('@hooks/useSpeakingDetector');
vi.mock('@hooks/useLayoutManager');
vi.mock('@hooks/useActiveSpeaker');
vi.mock('@hooks/useScreenShare.tsx');
vi.mock('@hooks/useToolbarButtons');

vi.mock('opentok-layout-js', async () => {
  const actual = await vi.importActual<typeof import('opentok-layout-js')>('opentok-layout-js');
  const openTokLayoutManager = actual.default;

  return {
    ...actual,
    default: (...args: Parameters<typeof openTokLayoutManager>) => {
      const instance = openTokLayoutManager(...args);
      const getLayout = instance.getLayout.bind(instance);

      vi.spyOn(instance, 'getLayout').mockImplementation((...$args) => {
        return {
          ...getLayout(...$args),
          // Mocked to return fixed values for easier testing
          publisherBox: {
            width: 640,
            height: 480,
            top: 0,
            left: 0,
          },
        };
      });

      return instance;
    },
  };
});

const mockUseSpeakingDetector = useSpeakingDetector as Mock<[UseSpeakingDetectorOptions], boolean>;
const mockUseLayoutManager = useLayoutManager as Mock<[], GetLayout>;
const mockUseActiveSpeaker = useActiveSpeaker as Mock<[], string | undefined>;
const mockUseScreenShare = useScreenShare as Mock<[], UseScreenShareType>;
const mockUseToolbarButtons = useToolbarButtons as Mock<
  [UseToolbarButtonsProps],
  UseToolbarButtons
>;

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

  beforeEach(() => {
    // after initializing the store to avoid having to mock all the mediaDevices$ sync logic.
    setupWindowNavigatorMock({
      mediaDevices: {
        enumerateDevices: Promise.resolve([]),
      },
    });

    mockedLocation.mockReturnValue({
      pathname: '/room/test-room-name',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    });

    mockPublisher = Object.assign(new EventEmitter(), {
      applyVideoFilter: vi.fn(),
      clearVideoFilter: vi.fn(),
      getAudioSource: () => defaultAudioDevice,
      videoWidth: () => 1280,
      videoHeight: () => 720,
      getVideoFilter: vi.fn(() => undefined),
    }) as unknown as Publisher;

    mockUseSpeakingDetector.mockReturnValue(false);
    mockUseLayoutManager.mockImplementation(() => (_dimensions, elements) => {
      return new Array(elements.length).fill({
        height: 720,
        left: 0,
        top: 0,
        width: 1280,
      }) as Box[];
    });
    mockUseActiveSpeaker.mockReturnValue(undefined);
    mockUseScreenShare.mockReturnValue({
      toggleShareScreen: () => Promise.resolve(),
      isSharingScreen: false,
      screenshareVideoElement: undefined,
      screensharingPublisher: null,
    });
    (useMediaQuery as Mock).mockReturnValue(false);
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

  it('should render', async () => {
    render(<MeetingRoom />);
    const meetingRoom = await screen.findByTestId('meetingRoom');
    expect(meetingRoom).not.toBeNull();
  });

  it('renders the small viewport header bar if it is on a small tab or device', async () => {
    (useMediaQuery as Mock).mockReturnValue(true);
    render(<MeetingRoom />);
    expect(await screen.findByTestId('smallViewportHeader')).not.toBeNull();
  });

  it('does not render the small viewport header bar if it is on desktop', async () => {
    // we do not need to mock the small view port value here given we already do it in beforeEach
    render(<MeetingRoom />);
    await waitFor(() => {
      expect(screen.queryByTestId('smallViewportHeader')).toBeNull();
    });
  });

  it('renders the recording indicator on desktop while recording is active', async () => {
    render(<MeetingRoom />, {
      sessionContext: {
        initialValue: {
          archiveId: 'archive-123',
        },
      },
    });

    expect(await screen.findByTestId('meetingRoomRecordingIndicatorContainer')).toBeVisible();
    expect(screen.getByTestId('recordingIndicator')).toBeVisible();
  });

  it('should call joinRoom on render only once', async () => {
    const { sessionContext, rerender } = render(<MeetingRoom />, {
      sessionContext: {
        __onCreated: (context) => {
          context.joinRoom = vi.fn();
        },
      },
    });

    act(() => {
      rerender(<MeetingRoom />);
    });

    await waitFor(() => {
      expect(sessionContext.current.joinRoom).toHaveBeenCalledWith('test-room-name');
    });
    await waitFor(() => {
      expect(sessionContext.current.joinRoom).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(sessionContext.current.joinRoom).toHaveBeenCalledTimes(1);
    });
  });

  it('should call publish after connected', async () => {
    const { sessionContext, publisherContext } = render(<MeetingRoom />, {
      publisherContext: {
        __onCreated: (context) => {
          context.publish = vi.fn();
        },
      },
      sessionContext: {
        initialValue: {
          connected: false,
        },
        __onCreated: (context) => {
          context.joinRoom = vi.fn(async () => {
            context.connected = true;
            await Promise.resolve();
          });
        },
      },
    });

    await waitFor(() => {
      expect(sessionContext.current.connected).toBe(true);
    });

    await waitFor(() => {
      expect(publisherContext.current.publish).toBeDefined();
    });
  });

  it('should display spinner until session is connected', async () => {
    const { sessionContext, rerender } = render(<MeetingRoom />, {
      publisherContext: {
        initialValue: {
          publisher: mockPublisher,
        },
      },
      sessionContext: {
        initialValue: {
          connected: false,
        },
      },
    });

    expect(screen.getByTestId('progress-spinner')).toBeInTheDocument();

    act(() => {
      sessionContext.current.connected = true;
    });

    act(() => {
      rerender(<MeetingRoom />);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('progress-spinner')).not.toBeInTheDocument();
    });
  });

  it('should hide subscribers and show participant hidden tile', async () => {
    const subscribers = [
      createSubscriberWrapper('sub1'),
      createSubscriberWrapper('sub2'),
      createSubscriberWrapper('sub3'),
      createSubscriberWrapper('sub4'),
      createSubscriberWrapper('sub5'),
      createSubscriberWrapper('sub6'),
      createSubscriberWrapper('sub7'),
    ];
    const { rerender, sessionContext } = render(<MeetingRoom />, {
      publisherContext: {
        initialValue: {
          publisher: mockPublisher,
          isPublishing: true,
        },
      },
      sessionContext: {
        initialValue: {
          layoutMode: 'active-speaker',
        },
        __onCreated: (context) => {
          context.joinRoom = vi.fn(async () => {
            context.connected = true;
            context.subscriberWrappers = subscribers;
            await Promise.resolve();
          });
        },
      },
    });

    await waitFor(() => {
      expect(sessionContext.current.connected).toBe(true);
    });

    act(() => {
      rerender(<MeetingRoom />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('subscriber-container-sub1')).toBeVisible();
      expect(screen.getByTestId('subscriber-container-sub2')).toBeVisible();
      expect(screen.getByTestId('subscriber-container-sub3')).toBeVisible();
      expect(screen.getByTestId('subscriber-container-sub4')).toBeVisible();
      expect(screen.getByTestId('hidden-participants')).toBeInTheDocument();
      expect(screen.getByTestId('subscriber-container-sub5')).not.toBeVisible();
      expect(screen.getByTestId('subscriber-container-sub6')).not.toBeVisible();
      expect(screen.getByTestId('subscriber-container-sub7')).not.toBeVisible();
    });
  });

  it.skip('should render subscribers in correct order', async () => {
    const [sub1, sub2, sub3] = new Array(3)
      .fill(0)
      .map((_s, index) => createSubscriberWrapper(`sub${index + 1}`));

    const { sessionContext, rerender } = render(<MeetingRoom />, {
      publisherContext: {
        initialValue: {
          publisher: mockPublisher,
          isPublishing: true,
        },
      },
      sessionContext: {
        __onCreated: (context) => {
          context.joinRoom = vi.fn(async () => {
            context.connected = true;
            context.subscriberWrappers = [sub1];
            await Promise.resolve();
          });
        },
        initialValue: {
          layoutMode: 'active-speaker',
        },
      },
    });

    await waitFor(() => {
      expect(sessionContext.current.connected).toBe(true);
    });

    act(() => {
      sessionContext.current.subscriberWrappers = [sub2, sub1];
      rerender(<MeetingRoom />);
    });

    const getSubIdsInRenderOrder = () =>
      screen.getAllByTestId('subscriber-container', { exact: false }).map((element) => element?.id);

    await waitFor(() => {
      expect(getSubIdsInRenderOrder()).toEqual(['sub1', 'sub2']);
    });

    act(() => {
      sessionContext.current.subscriberWrappers = [sub3, sub2, sub1];
      rerender(<MeetingRoom />);
    });

    await waitFor(() => {
      expect(getSubIdsInRenderOrder()).toEqual(['sub1', 'sub2', 'sub3']);
    });
  });

  it.skip('should display chat unread number', async () => {
    const { sessionContext } = render(<MeetingRoom />, {
      publisherContext: {
        initialValue: {
          publisher: mockPublisher,
        },
      },
      sessionContext: {
        initialValue: {
          connected: true,
        },
      },
    });

    sessionContext.current.unreadCount = 4;

    await waitFor(() => {
      expect(screen.getByTestId('chat-button-unread-count')).toHaveTextContent('4');
    });
  });

  describe('video quality problem alert', () => {
    it('should not be displayed when not publishing video', async () => {
      render(<MeetingRoom />, {
        publisherContext: {
          initialValue: {
            isVideoEnabled: false,
            quality: 'poor',
          },
        },
      });

      await waitFor(() => {
        expect(
          screen.queryByText(
            'Please check your connectivity. Your video may be disabled to improve the user experience'
          )
        ).not.toBeInTheDocument();
      });
    });
  });

  it('should redirect user to goodbye page if unable to publish', async () => {
    const publishingBlockedError = {
      header: 'Difficulties joining room',
      caption:
        "We're having trouble connecting you with others in the meeting room. Please check your network and try again.",
    };
    const { rerender } = render(<MeetingRoom />, {
      publisherContext: {
        initialValue: {
          publishingError: publishingBlockedError,
        },
      },
    });

    act(() => {
      rerender(<MeetingRoom />);
    });

    await waitFor(() => {
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

  it('should redirect to waiting room when username is missing', async () => {
    render(<MeetingRoom />, {
      userContext: {
        value: {
          defaultSettings: {
            name: '',
          },
        },
      },
    });

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/waiting-room/test-room-name');
    });
  });

  it('should redirect to waiting room when username is only whitespace', async () => {
    render(<MeetingRoom />, {
      userContext: {
        value: {
          defaultSettings: {
            name: '   ',
          },
        },
      },
    });

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/waiting-room/test-room-name');
    });
  });

  it('should not redirect to waiting room when username is missing but bypass is true', async () => {
    mockedLocation.mockClear();
    mockedLocation.mockReturnValue({
      pathname: '/room/test-room-name',
      search: '?bypass=true',
      hash: '',
      state: null,
      key: 'default',
    });

    render(<MeetingRoom />, {
      userContext: {
        value: {
          defaultSettings: {
            name: '',
          },
        },
      },
    });

    await waitFor(() => {
      expect(mockedNavigate).not.toHaveBeenCalledWith('/waiting-room/test-room-name');
    });
  });
});

function render(
  ui: ReactElement,
  {
    userContext,
    sessionContext,
    publisherContext,
  }: {
    userContext?: ProviderOptions['UserContext'];
    sessionContext?: ProviderOptions['SessionContext'];
    publisherContext?: ProviderOptions['PublisherContext'];
  } = {}
) {
  const { wrapper, ...context } = makeTestProvider(
    [providers.user, providers.session, providers.publisher],
    {
      userContext: {
        ...userContext,
        value: {
          defaultSettings: {
            name: 'John Doe',
          },
          ...userContext?.value,
        },
      },
      sessionContext,
      publisherContext,
    }
  );

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
