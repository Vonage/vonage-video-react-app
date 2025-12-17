import '../../css/index.css';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { render as renderBase, screen, waitFor } from '@testing-library/react';
import { Publisher, Subscriber } from '@vonage/client-sdk-video';
import { EventEmitter } from 'stream';
import * as mui from '@mui/material';
import { ReactElement } from 'react';
import { UserContextType } from '@Context/user';
import { SubscriberWrapper } from '@app-types/session';
import useUserContext from '@hooks/useUserContext';
import useDevices from '@hooks/useDevices';
import { AllMediaDevices } from '@app-types/room';
import { allMediaDevices, defaultAudioDevice } from '@utils/mockData/device';
import useSpeakingDetector from '@hooks/useSpeakingDetector';
import useLayoutManager, { GetLayout } from '@hooks/useLayoutManager';
import useActiveSpeaker from '@hooks/useActiveSpeaker';
import useScreenShare, { UseScreenShareType } from '@hooks/useScreenShare';
import { RIGHT_PANEL_BUTTON_COUNT } from '@utils/constants';
import useToolbarButtons, {
  UseToolbarButtons,
  UseToolbarButtonsProps,
} from '@hooks/useToolbarButtons';
import { makePublisherProviderWrapper, PublisherProviderWrapperOptions } from '@test/providers';
import MeetingRoom from './MeetingRoom';
import type { Box } from 'opentok-layout-js';

const mockedNavigate = vi.fn();
const mockedParams = { roomName: 'test-room-name' };
const mockedLocation = vi.fn();
vi.mock('@hooks/useBackgroundPublisherContext', () => ({
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

vi.mock('@hooks/useDevices.tsx');
vi.mock('@hooks/useUserContext.tsx');
vi.mock('@hooks/useSpeakingDetector.tsx');
vi.mock('@hooks/useLayoutManager.tsx');
vi.mock('@hooks/useActiveSpeaker.tsx');
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

const mockUseDevices = useDevices as Mock<
  [],
  { allMediaDevices: AllMediaDevices; getAllMediaDevices: () => void }
>;

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
    mockUseUserContext.mockImplementation(() => mockUserContext);
    mockPublisher = Object.assign(new EventEmitter(), {
      applyVideoFilter: vi.fn(),
      clearVideoFilter: vi.fn(),
      getAudioSource: () => defaultAudioDevice,
      videoWidth: () => 1280,
      videoHeight: () => 720,
      getVideoFilter: vi.fn(() => undefined),
    }) as unknown as Publisher;

    mockUseDevices.mockReturnValue({
      getAllMediaDevices: vi.fn(),
      allMediaDevices,
    });

    mockUseSpeakingDetector.mockReturnValue(false);
    mockUseLayoutManager.mockImplementation(() => (_dimensions, elements) => {
      return Array(elements.length).fill({
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
    render(<MeetingRoom />);
    const meetingRoom = screen.getByTestId('meetingRoom');
    expect(meetingRoom).not.toBeNull();
  });

  it('renders the small viewport header bar if it is on a small tab or device', () => {
    (mui.useMediaQuery as Mock).mockReturnValue(true);
    render(<MeetingRoom />);
    expect(screen.getByTestId('smallViewportHeader')).not.toBeNull();
  });

  it('does not render the small viewport header bar if it is on desktop', () => {
    // we do not need to mock the small view port value here given we already do it in beforeEach
    render(<MeetingRoom />);
    expect(screen.queryByTestId('smallViewportHeader')).toBeNull();
  });

  it('should call joinRoom on render only once', () => {
    const { sessionContext, rerender } = render(<MeetingRoom />, {
      sessionContext: {
        __onCreated: (context) => {
          context.joinRoom = vi.fn();
        },
      },
    });

    expect(sessionContext.current.joinRoom).toHaveBeenCalledWith('test-room-name');
    expect(sessionContext.current.joinRoom).toHaveBeenCalledTimes(1);
    rerender(<MeetingRoom />);
    rerender(<MeetingRoom />);
    rerender(<MeetingRoom />);
    rerender(<MeetingRoom />);
    expect(sessionContext.current.joinRoom).toHaveBeenCalledTimes(1);
  });

  it('should call publish after connected', () => {
    const { sessionContext, publisherContext } = render(<MeetingRoom />, {
      publisherContext: {
        __onCreated: (context) => {
          context.publish = vi.fn();
        },
      },
      sessionContext: {
        __onCreated: (context) => {
          context.joinRoom = vi.fn(async () => {
            context.connected = true;
            await Promise.resolve();
          });
        },
      },
    });

    expect(sessionContext.current.joinRoom).toHaveBeenCalledWith('test-room-name');

    waitFor(() => {
      expect(publisherContext.current.publish).toHaveBeenCalledTimes(1);
    });
  });

  it('should display publisher', () => {
    const { rerender } = render(<MeetingRoom />, {
      publisherContext: {
        initialValue: {
          publisher: mockPublisher,
          isPublishing: true,
        },
      },
      sessionContext: {
        initialValue: {
          connected: true,
        },
      },
    });

    rerender(<MeetingRoom />);

    waitFor(() => {
      expect(screen.getByTestId('publisher-container')).toBeInTheDocument();
    });
  });

  it('should display spinner until session is connected', () => {
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

    sessionContext.current.connected = true;
    rerender(<MeetingRoom />);
    waitFor(() => {
      expect(screen.queryByTestId('progress-spinner')).not.toBeInTheDocument();
    });
  });

  it('should hide subscribers and show participant hidden tile', () => {
    const subscribers = [
      createSubscriberWrapper('sub1'),
      createSubscriberWrapper('sub2'),
      createSubscriberWrapper('sub3'),
      createSubscriberWrapper('sub4'),
      createSubscriberWrapper('sub5'),
      createSubscriberWrapper('sub6'),
      createSubscriberWrapper('sub7'),
    ];
    const { rerender } = render(<MeetingRoom />, {
      publisherContext: {
        initialValue: {
          publisher: mockPublisher,
        },
      },
      sessionContext: {
        initialValue: {
          connected: true,
          layoutMode: 'active-speaker',
          subscriberWrappers: subscribers,
        },
      },
    });

    rerender(<MeetingRoom />);

    waitFor(() => {
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

  it('should render subscribers in correct order', () => {
    const [sub1, sub2, sub3] = Array(3)
      .fill(0)
      .map((_s, index) => createSubscriberWrapper(`sub${index + 1}`));
    const { sessionContext, rerender } = render(<MeetingRoom />, {
      publisherContext: {
        initialValue: {
          publisher: mockPublisher,
        },
      },
      sessionContext: {
        initialValue: {
          connected: true,
          subscriberWrappers: [sub1],
          layoutMode: 'active-speaker',
        },
      },
    });

    sessionContext.current.subscriberWrappers = [sub2, sub1];
    rerender(<MeetingRoom />);

    const getSubIdsInRenderOrder = () =>
      screen.getAllByTestId('subscriber-container', { exact: false }).map((element) => element?.id);

    // sub1 joined first so should stay in position
    waitFor(() => {
      expect(getSubIdsInRenderOrder()).toEqual(['sub1', 'sub2']);
    });

    sessionContext.current.subscriberWrappers = [sub3, sub2, sub1];
    rerender(<MeetingRoom />);

    // sub1 and sub2 joined first so should stay in position ahead of sub3
    waitFor(() => {
      expect(getSubIdsInRenderOrder()).toEqual(['sub1', 'sub2', 'sub3']);
    });
  });

  it('should display chat unread number', () => {
    const { sessionContext, rerender } = render(<MeetingRoom />, {
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
    rerender(<MeetingRoom />);
    sessionContext.current.unreadCount = 4;
    rerender(<MeetingRoom />);
    expect(screen.queryAllByTestId('chat-button-unread-count')[0]).toHaveTextContent('4');
  });

  describe('video quality problem alert', () => {
    it('should not be displayed when not publishing video', () => {
      render(<MeetingRoom />, {
        publisherContext: {
          initialValue: {
            isVideoEnabled: false,
            quality: 'poor',
          },
        },
      });

      const connectionAlert = screen.queryByText(
        'Please check your connectivity. Your video may be disabled to improve the user experience'
      );
      expect(connectionAlert).not.toBeInTheDocument();
    });

    it('should be displayed when publishing video', () => {
      const { rerender } = render(<MeetingRoom />, {
        publisherContext: {
          initialValue: {
            isVideoEnabled: true,
            quality: 'poor',
          },
        },
      });

      rerender(<MeetingRoom />);

      waitFor(() => {
        const connectionAlert = screen.getByText(
          'Please check your connectivity. Your video may be disabled to improve the user experience'
        );
        expect(connectionAlert).toBeInTheDocument();
      });
    });

    it('should be hidden when user stops publishing video', () => {
      const { publisherContext, rerender } = render(<MeetingRoom />, {
        publisherContext: {
          initialValue: {
            isVideoEnabled: true,
            quality: 'poor',
          },
        },
      });

      rerender(<MeetingRoom />);

      waitFor(() => {
        const connectionAlert = screen.queryByText(
          'Please check your connectivity. Your video may be disabled to improve the user experience'
        );
        expect(connectionAlert).toBeInTheDocument();
      });

      publisherContext.current.isVideoEnabled = false;
      rerender(<MeetingRoom />);

      waitFor(() => {
        const connectionAlert = screen.queryByText(
          'Please check your connectivity. Your video may be disabled to improve the user experience'
        );
        expect(connectionAlert).not.toBeInTheDocument();
      });
    });
  });

  it('should redirect user to goodbye page if unable to publish', () => {
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

    rerender(<MeetingRoom />);

    waitFor(() => {
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
});

function render(ui: ReactElement, options: PublisherProviderWrapperOptions = {}) {
  const { PublisherProviderWrapper, ...props } = makePublisherProviderWrapper({
    ...options,
    publisherContext: {},
  });

  return {
    ...props,
    ...renderBase(ui, { wrapper: PublisherProviderWrapper }),
  };
}
