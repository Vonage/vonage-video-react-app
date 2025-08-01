import { afterAll, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { Publisher } from '@vonage/client-sdk-video';
import EventEmitter from 'events';
import userEvent from '@testing-library/user-event';
import UserProvider, { UserContextType } from '../../Context/user';
import useUserContext from '../../hooks/useUserContext';
import {
  PreviewPublisherContextType,
  PreviewPublisherProvider,
} from '../../Context/PreviewPublisherProvider';
import WaitingRoom from './WaitingRoom';
import useDevices from '../../hooks/useDevices';
import { AllMediaDevices } from '../../types';
import { allMediaDevices, defaultAudioDevice } from '../../utils/mockData/device';
import usePreviewPublisherContext from '../../hooks/usePreviewPublisherContext';
import useBackgroundPublisherContext from '../../hooks/useBackgroundPublisherContext';
import usePermissions, { PermissionsHookType } from '../../hooks/usePermissions';
import { DEVICE_ACCESS_STATUS } from '../../utils/constants';
import waitUntilPlaying from '../../utils/waitUntilPlaying';
import { BackgroundPublisherContextType } from '../../Context/BackgroundPublisherProvider';

const mockedNavigate = vi.fn();
const mockedParams = { roomName: 'test-room-name' };
const mockedLocation = vi.fn();
const mockedDestroyPublisher = vi.fn();
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
const WaitingRoomWithProviders = () => (
  <UserProvider>
    <PreviewPublisherProvider>
      <WaitingRoom />
    </PreviewPublisherProvider>
  </UserProvider>
);

vi.mock('../../hooks/useDevices.tsx');
vi.mock('../../hooks/useUserContext.tsx');
vi.mock('../../hooks/usePreviewPublisherContext.tsx');
vi.mock('../../hooks/useBackgroundPublisherContext.tsx');
vi.mock('../../hooks/usePermissions.tsx');
vi.mock('../../utils/waitUntilPlaying/waitUntilPlaying.ts');

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
  setUser: vi.fn(),
} as unknown as UserContextType;
const mockUsePreviewPublisherContext = usePreviewPublisherContext as Mock<
  [],
  PreviewPublisherContextType
>;
const mockUseBackgroundPublisherContext = useBackgroundPublisherContext as Mock<
  [],
  BackgroundPublisherContextType
>;
const mockUsePermissions = usePermissions as Mock<[], PermissionsHookType>;
const mockWaitUntilPlaying = vi.mocked(waitUntilPlaying);
const reloadSpy = vi.fn();

describe('WaitingRoom', () => {
  const nativeWindowLocation = window.location as string & Location;
  let previewPublisherContext: PreviewPublisherContextType;
  let backgroundPublisherContext: BackgroundPublisherContextType;
  let mockPublisher: Publisher;
  let mockPublisherVideoElement: HTMLVideoElement;

  beforeEach(() => {
    mockUseUserContext.mockImplementation(() => mockUserContext);
    mockUseDevices.mockReturnValue({
      getAllMediaDevices: vi.fn(),
      allMediaDevices,
    });
    mockPublisher = Object.assign(new EventEmitter(), {
      applyVideoFilter: vi.fn(),
      clearVideoFilter: vi.fn(),
      getAudioSource: () => defaultAudioDevice,
      videoWidth: () => 1280,
      videoHeight: () => 720,
    }) as unknown as Publisher;
    mockPublisherVideoElement = document.createElement('video');
    mockPublisherVideoElement.title = 'preview-publisher';
    previewPublisherContext = {
      publisher: null,
      initLocalPublisher: vi.fn(),
      destroyPublisher: mockedDestroyPublisher,
    } as unknown as PreviewPublisherContextType;
    mockUsePreviewPublisherContext.mockImplementation(() => previewPublisherContext);
    backgroundPublisherContext = {
      publisher: null,
      initBackgroundLocalPublisher: vi.fn(),
      destroyBackgroundPublisher: mockedDestroyPublisher,
    } as unknown as BackgroundPublisherContextType;
    mockUseBackgroundPublisherContext.mockImplementation(() => backgroundPublisherContext);
    mockUsePermissions.mockReturnValue({
      accessStatus: DEVICE_ACCESS_STATUS.ACCEPTED,
      setAccessStatus: vi.fn(),
    });
    mockWaitUntilPlaying.mockImplementation(
      () =>
        new Promise<void>((res) => {
          res();
        })
    );
    Object.defineProperty(window, 'location', {
      value: {
        reload: reloadSpy,
      },
      writable: true,
    });
  });

  afterAll(() => {
    window.location = nativeWindowLocation;
  });

  it('should render', () => {
    render(<WaitingRoomWithProviders />);
    const waitingRoom = screen.getByTestId('waitingRoom');
    expect(waitingRoom).not.toBeNull();
  });

  it('should display a video loading element on entering', () => {
    render(<WaitingRoomWithProviders />);
    const videoLoadingElement = screen.getByTestId('VideoLoading');
    expect(videoLoadingElement).toBeVisible();
  });

  it('should eventually display a preview publisher', async () => {
    const { rerender } = render(<WaitingRoomWithProviders />);
    act(() => {
      // After the preview publisher initializes.
      previewPublisherContext.publisher = mockPublisher;
      previewPublisherContext.publisherVideoElement = mockPublisherVideoElement;
    });
    rerender(<WaitingRoomWithProviders />);

    const previewPublisher = screen.getByTitle('publisher-preview');
    await waitFor(() => expect(previewPublisher).toBeVisible());
  });

  it('should call destroyPublisher when navigating away from waiting room', async () => {
    const user = userEvent.setup();
    render(<WaitingRoomWithProviders />);

    // Verify we're in the waiting room for test-room-name
    expect(screen.getByText('test-room-name')).toBeInTheDocument();

    // Submit a name to navigate away from the waiting room
    const input = screen.getByPlaceholderText('Enter your name');
    await user.type(input, 'Betsey Trotwood');
    expect(input).toHaveValue('Betsey Trotwood');
    await user.keyboard('{Enter}');

    expect(mockedDestroyPublisher).toHaveBeenCalled();
  });

  it('should reload window when device permissions change', async () => {
    const { rerender } = render(<WaitingRoomWithProviders />);
    expect(reloadSpy).not.toBeCalled();

    act(() => {
      previewPublisherContext.accessStatus = DEVICE_ACCESS_STATUS.ACCESS_CHANGED;
    });
    rerender(<WaitingRoomWithProviders />);
    expect(reloadSpy).toBeCalled();
  });
});
