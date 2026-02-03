import { beforeEach, describe, expect, it, vi, Mock, beforeAll, afterAll } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { Publisher } from '@vonage/client-sdk-video';
import EventEmitter from 'events';
import userEvent from '@testing-library/user-event';
import useDevices from '@hooks/useDevices';
import { allMediaDevices, defaultAudioDevice } from '@utils/mockData/device';
import usePermissions from '@hooks/usePermissions';
import { DEVICE_ACCESS_STATUS } from '@utils/constants';
import waitUntilPlaying from '@utils/waitUntilPlaying';
import { makeRoomContextWrapper, RoomContextWrapperOptions } from '@test/providers';
import { type PreviewPublisherContextType } from '@Context/PreviewPublisherProvider';
import mediaDevicesMock from '@common/test/mocks/mediaDevicesMock';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import composeProviders from '@common/helpers/composeProviders';
import WaitingRoom from './WaitingRoom';
import SuspenseBoundary from '@common/components/SuspenseBoundary';
import renderAsyncComponent from '@test-helpers/renderAsyncComponent';

const mockedNavigate = vi.fn();
const mockedParams = { roomName: 'test-room-name' };
const mockedLocation = vi.fn();

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...mod,
    useNavigate: () => mockedNavigate,
    useParams: () => mockedParams,
    useLocation: () => mockedLocation,
    Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
  };
});

vi.mock('@vonage/client-sdk-video', async () => {
  const actual = await vi.importActual('@vonage/client-sdk-video');
  return {
    ...actual,
    Publisher: vi.fn(),
  };
});

vi.mock('@hooks/useDevices.tsx');
vi.mock('@hooks/usePermissions.tsx');
vi.mock('@utils/waitUntilPlaying/waitUntilPlaying.ts');

const { locationBackUp, locationMock } = getLocationMock();

function setupMediaDevices() {
  Object.defineProperty(globalThis.navigator, 'mediaDevices', {
    writable: true,
    configurable: true,
    value: mediaDevicesMock,
  });

  vi.spyOn(mediaDevicesMock, 'addEventListener').mockImplementation(() => {});
  vi.spyOn(mediaDevicesMock, 'removeEventListener').mockImplementation(() => {});
  vi.spyOn(mediaDevicesMock, 'enumerateDevices').mockResolvedValue([]);
}

function setupPermissions() {
  Object.defineProperty(globalThis.navigator, 'permissions', {
    writable: true,
    configurable: true,
    value: {
      query: vi.fn().mockResolvedValue({ state: 'granted' }),
    },
  });
}

describe('WaitingRoom', () => {
  beforeAll(() => {
    globalThis.location = locationMock;

    if (!globalThis.performance.timing) {
      Object.defineProperty(globalThis.performance, 'timing', {
        writable: true,
        configurable: true,
        value: {
          navigationStart: Date.now(),
          loadEventEnd: 0,
          domContentLoadedEventEnd: 0,
          domComplete: 0,
        },
      });
    }
  });

  afterAll(() => {
    globalThis.location = locationBackUp;
  });

  let mockedDestroyPublisher: Mock;
  let mockPublisher: Publisher;
  let mockPublisherVideoElement: HTMLVideoElement;

  function createMockPublisher() {
    return Object.assign(new EventEmitter(), {
      applyVideoFilter: vi.fn(),
      clearVideoFilter: vi.fn(),
      getAudioSource: () => defaultAudioDevice,
      videoWidth: () => 1280,
      videoHeight: () => 720,
      destroy: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    }) as unknown as Publisher;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    setupMediaDevices();
    setupPermissions();

    mockPublisher = createMockPublisher();

    mockPublisherVideoElement = document.createElement('video');
    mockPublisherVideoElement.title = 'preview-publisher';
    mockedDestroyPublisher = vi.fn();

    vi.mocked(useDevices).mockReturnValue({
      getAllMediaDevices: vi.fn(),
      allMediaDevices,
    });

    vi.mocked(usePermissions).mockReturnValue({
      accessStatus: DEVICE_ACCESS_STATUS.ACCEPTED,
      setAccessStatus: vi.fn(),
    });

    vi.mocked(waitUntilPlaying).mockResolvedValue();

    vi.spyOn(globalThis.location, 'reload');
  });

  it('should render', async () => {
    await render(<WaitingRoom />);
    await waitFor(() => {
      expect(screen.getByTestId('waitingRoom')).toBeInTheDocument();
    });
  });

  it('should display a video loading element on entering', async () => {
    await render(<WaitingRoom />, {
      appConfigOptions: {
        value: {
          isAppConfigLoaded: false,
          videoSettings: {
            allowCameraControl: true,
          },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('VideoLoading')).toBeVisible();
    });
  });

  it('should eventually display a preview publisher', async () => {
    const { container } = await render(<WaitingRoom />, {
      previewPublisherOptions: {
        __interceptor: (context: PreviewPublisherContextType) => {
          context.publisher = mockPublisher;
          context.publisherVideoElement = mockPublisherVideoElement;
          context.isVideoEnabled = true;
        },
      },
    });

    await waitFor(() => {
      expect(container.querySelector('[data-video-container]')).toBeVisible();
      expect(screen.getByTitle('publisher-preview')).toBeVisible();
    });
  });

  it('should call destroyPublisher when navigating away from waiting room', async () => {
    const user = userEvent.setup();

    const { unmount } = await render(<WaitingRoom />, {
      previewPublisherOptions: {
        __onCreated: (context: PreviewPublisherContextType) => {
          context.publisher = mockPublisher;
          const originalDestroy = context.destroyPublisher.bind(context);
          context.destroyPublisher = () => {
            mockedDestroyPublisher();
            return originalDestroy();
          };
        },
        __interceptor: (context: PreviewPublisherContextType) => {
          context.publisher = mockPublisher;
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('test-room-name')).toBeInTheDocument();
    });

    const input = screen.getByRole('textbox', { name: /name/i });
    await user.type(input, 'Betsey Trotwood');
    expect(input).toHaveValue('Betsey Trotwood');

    await user.keyboard('{Enter}');

    unmount();

    await waitFor(() => {
      expect(mockedDestroyPublisher).toHaveBeenCalled();
    });
  });

  it('should reload window when device permissions change', async () => {
    await render(<WaitingRoom />, {
      previewPublisherOptions: {
        __interceptor: (context: PreviewPublisherContextType) => {
          context.accessStatus = DEVICE_ACCESS_STATUS.ACCEPTED;
        },
      },
    });

    expect(globalThis.location.reload).not.toHaveBeenCalled();

    // Simulate device permission change by updating the mock and rerendering
    vi.mocked(usePermissions).mockReturnValue({
      accessStatus: DEVICE_ACCESS_STATUS.ACCESS_CHANGED,
      setAccessStatus: vi.fn(),
    });

    await render(<WaitingRoom />);

    await waitFor(() => {
      expect(globalThis.location.reload).toHaveBeenCalled();
    });
  });

  it('should not render ControlPanel when allowDeviceSelection is false', async () => {
    const { container } = await render(<WaitingRoom />, {
      appConfigOptions: {
        value: {
          waitingRoomSettings: {
            allowDeviceSelection: false,
          },
        },
      },
      previewPublisherOptions: {
        __interceptor: (context: PreviewPublisherContextType) => {
          context.accessStatus = DEVICE_ACCESS_STATUS.ACCEPTED;
        },
      },
    });

    await waitFor(
      () => {
        const controlPanel = container.querySelector('[data-testid="ControlPanel"]');
        expect(controlPanel).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should render ControlPanel when allowDeviceSelection is true', async () => {
    await render(<WaitingRoom />, {
      appConfigOptions: {
        value: {
          waitingRoomSettings: {
            allowDeviceSelection: true,
          },
        },
      },
      previewPublisherOptions: {
        __interceptor: (context: PreviewPublisherContextType) => {
          context.accessStatus = DEVICE_ACCESS_STATUS.ACCEPTED;
        },
      },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('ControlPanel')).toBeInTheDocument();
    });
  });
});

/**
 * Creates a copy of the global location object where reload can be spied
 * The copy retains all original properties and methods of the location object
 * @returns {Location} A mock of the Location object
 */
function getLocationMock() {
  const { location } = globalThis;
  const locationMock = Object.create(Object.getPrototypeOf(location) as Location);

  Object.assign(locationMock, location);

  // override locked properties
  locationMock.reload = location.reload.bind(location);

  return { locationBackUp: location, locationMock };
}

async function render(ui: ReactElement, options?: RoomContextWrapperOptions) {
  const { RoomProviderWrapper, ...contexts } = makeRoomContextWrapper(options);

  const Wrapper = composeProviders(
    SuspenseBoundary,
    RoomProviderWrapper,
    backgroundEffectsDialog$.Provider,
    precallNetworkTestDialog$.Provider
  );

  const renderResult = await renderAsyncComponent(ui, { wrapper: Wrapper });

  return {
    ...contexts,
    ...renderResult,
  };
}
