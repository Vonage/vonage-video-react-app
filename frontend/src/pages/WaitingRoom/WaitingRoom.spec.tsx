import { beforeEach, describe, expect, it, vi, Mock, beforeAll, afterAll } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { Publisher } from '@vonage/client-sdk-video';
import EventEmitter from 'events';
import userEvent from '@testing-library/user-event';
import { defaultAudioDevice } from '@utils/mockData/device';
import usePermissions from '@hooks/usePermissions';
import { DEVICE_ACCESS_STATUS } from '@utils/constants';
import waitUntilPlaying from '@utils/waitUntilPlaying';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import { type PreviewPublisherContextType } from '@Context/PreviewPublisherProvider';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import composeProviders from '@web/helpers/composeProviders';
import WaitingRoom from './WaitingRoom';
import SuspenseBoundary from '@web/components/SuspenseBoundary';
import renderAsyncComponent from '@web-test/renderAsyncComponent';
import { setupWindowNavigatorMock } from '@web-test/fixtures';
import { env } from '../../env';

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

vi.mock('@hooks/usePermissions.tsx');
vi.mock('@utils/waitUntilPlaying/waitUntilPlaying.ts');

const { locationBackUp, locationMock } = getLocationMock();

function setupMediaDevices() {
  setupWindowNavigatorMock({
    mediaDevices: {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      enumerateDevices: Promise.resolve([]),
    },
  });
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

  it('should display skeleton while video is loading', async () => {
    env.partialUpdate({
      WAITING_ROOM_ALLOW_DEVICE_SELECTION: true,
    });

    await render(<WaitingRoom />, {
      previewPublisherContext: {
        __interceptor: (context: PreviewPublisherContextType) => {
          context.accessStatus = DEVICE_ACCESS_STATUS.ACCEPTED;
          context.isVideoLoading = true;
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('VideoContainerSkeleton')).toBeVisible();
    });
  });

  it('should eventually display a preview publisher', async () => {
    env.partialUpdate({
      WAITING_ROOM_ALLOW_DEVICE_SELECTION: true,
    });

    const { container } = await render(<WaitingRoom />, {
      previewPublisherContext: {
        __interceptor: (context: PreviewPublisherContextType) => {
          context.publisher = mockPublisher;
          context.publisherVideoElement = mockPublisherVideoElement;
          context.isVideoEnabled = true;
          context.isVideoLoading = false;
          context.accessStatus = DEVICE_ACCESS_STATUS.ACCEPTED;
        },
      },
    });

    await waitFor(() => {
      expect(container.querySelector('[data-video-container]')).toBeVisible();
      expect(screen.getByTitle('preview-publisher')).toBeVisible();
    });
  });

  it('should call destroyPublisher when navigating away from waiting room', async () => {
    const user = userEvent.setup();

    env.partialUpdate({
      WAITING_ROOM_ALLOW_DEVICE_SELECTION: true,
    });

    const { unmount } = await render(<WaitingRoom />, {
      previewPublisherContext: {
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
          context.isVideoLoading = false;
          context.accessStatus = DEVICE_ACCESS_STATUS.ACCEPTED;
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

    expect(mockedDestroyPublisher).toHaveBeenCalled();
  });

  it('should render VideoContainer when video loading finishes', async () => {
    env.partialUpdate({
      WAITING_ROOM_ALLOW_DEVICE_SELECTION: true,
    });

    const { container } = await render(<WaitingRoom />, {
      previewPublisherContext: {
        __interceptor: (context: PreviewPublisherContextType) => {
          context.accessStatus = DEVICE_ACCESS_STATUS.ACCEPTED;
          context.isVideoLoading = false;
          context.publisher = mockPublisher;
        },
      },
    });

    await waitFor(() => {
      expect(container.querySelector('[data-video-container]')).toBeVisible();
    });
  });

  it('should not render ControlPanel when allowDeviceSelection is false', async () => {
    env.partialUpdate({
      WAITING_ROOM_ALLOW_DEVICE_SELECTION: false,
    });

    const { container } = await render(<WaitingRoom />, {
      previewPublisherContext: {
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
    env.partialUpdate({
      WAITING_ROOM_ALLOW_DEVICE_SELECTION: true,
    });

    await render(<WaitingRoom />, {
      previewPublisherContext: {
        __interceptor: (context: PreviewPublisherContextType) => {
          context.accessStatus = DEVICE_ACCESS_STATUS.ACCEPTED;
          context.isVideoLoading = false;
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

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
  publisherContext?: ProviderOptions['PublisherContext'];
  backgroundPublisherContext?: ProviderOptions['BackgroundPublisherContext'];
  previewPublisherContext?: ProviderOptions['PreviewPublisherContext'];
};

async function render(
  ui: ReactElement,
  {
    userContext,
    sessionContext,
    publisherContext,
    backgroundPublisherContext,
    previewPublisherContext,
  }: RenderOptions = {}
) {
  const { wrapper: MainWrapper, ...contexts } = makeTestProvider(
    [
      providers.user,
      providers.session,
      providers.publisher,
      providers.backgroundPublisher,
      providers.previewPublisher,
    ],
    {
      userContext,
      sessionContext,
      publisherContext,
      backgroundPublisherContext,
      previewPublisherContext,
    }
  );

  const wrapper = composeProviders(
    SuspenseBoundary,
    MainWrapper,
    backgroundEffectsDialog$.Provider,
    precallNetworkTestDialog$.Provider
  );

  const renderResult = await renderAsyncComponent(ui, { wrapper });

  return {
    ...contexts,
    ...renderResult,
  };
}
