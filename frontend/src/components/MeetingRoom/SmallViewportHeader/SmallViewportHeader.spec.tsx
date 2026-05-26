import { vi, describe, it, Mock, expect, beforeEach, beforeAll } from 'vitest';
import {
  makeMediaDeviceInfos,
  makeMediaStreamMock,
  setupWindowNavigatorMock,
} from '@web-test/fixtures';
import { render as renderBase, screen, fireEvent, waitFor } from '@testing-library/react';
import jwt from 'jsonwebtoken';
import usePublisherContext from '@hooks/usePublisherContext';
import { PublisherContextType } from '@Context/PublisherProvider';
import mediaDevices$ from '@core/stores/devices';
import { makeTestProvider, providers } from '@test/providers';
import SmallViewportHeader from './SmallViewportHeader';

const { mockIsMobile } = vi.hoisted(() => ({
  mockIsMobile: vi.fn().mockReturnValue(false),
}));

vi.mock('@hooks/usePublisherContext');
vi.mock('@web/platform', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@web/platform')>();
  return {
    ...actual,
    isMobile: mockIsMobile,
  };
});

const mockUsePublisherContext = usePublisherContext as Mock<[], PublisherContextType>;

const devices = makeMediaDeviceInfos();
const videoDevices = devices.filter((d) => d.kind === 'videoinput');

const mockSessionId = '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE';
const mockedRoomName = 'test-room-name';
const mockSessionKey: string = jwt.sign(
  { sessionId: mockSessionId, roomName: mockedRoomName },
  'test',
  {
    algorithm: 'HS256',
  }
);

describe('SmallViewportHeader component', () => {
  let publisherContext: PublisherContextType;

  beforeAll(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });

    // Mock the native devices API
    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        dispatchEvent: vi.fn().mockReturnValue(true),
        enumerateDevices: Promise.resolve(devices),
        getUserMedia: Promise.resolve(
          makeMediaStreamMock({
            getVideoTracks: [],
            getAudioTracks: [],
          })
        ),
      },
    });
  });

  beforeEach(() => {
    publisherContext = {
      publisherContext: { cycleVideo: vi.fn() } as unknown as PublisherContextType['publisher'],
      isVideoEnabled: true,
    } as unknown as PublisherContextType;

    mockUsePublisherContext.mockReturnValue(publisherContext);

    // Initialize the store with video devices
    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: devices,
    }));
  });

  it('renders the room name', () => {
    render(<SmallViewportHeader />);

    expect(screen.getByText(mockedRoomName)).toBeInTheDocument();
  });

  it('shows the recording icon if it is currently in progress', () => {
    render(<SmallViewportHeader />, {
      initialValue: { archiveId: '123-456' },
    });

    expect(screen.getByTestId('recordingIndicator')).toBeInTheDocument();
  });

  it('does not show the recording icon if it there is not one happening', () => {
    render(<SmallViewportHeader />);

    expect(screen.queryByTestId('recordingIndicator')).not.toBeInTheDocument();
  });

  it('copies room share URL to clipboard', async () => {
    render(<SmallViewportHeader />);

    const copyButton = screen.getByTestId('vivid-icon-copy-line');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining(mockSessionKey)
      );
      expect(screen.getByTestId('vivid-icon-check-sent-line')).toBeInTheDocument();
    });
  });

  it('shows the camera switch button when video is enabled', () => {
    mockUsePublisherContext.mockReturnValue({
      publisherContext: { cycleVideo: vi.fn() } as unknown as PublisherContextType['publisher'],
      isVideoEnabled: true,
    } as unknown as PublisherContextType);

    render(<SmallViewportHeader />);

    expect(screen.getByTestId('vivid-icon-camera-switch-line')).toBeInTheDocument();
  });

  it('does not show the camera switch button when video is disabled', () => {
    mockUsePublisherContext.mockReturnValue({
      publisherContext: { cycleVideo: vi.fn() } as unknown as PublisherContextType['publisher'],
      isVideoEnabled: false,
    } as unknown as PublisherContextType);

    render(<SmallViewportHeader />);

    expect(screen.queryByTestId('vivid-icon-camera-switch-line')).not.toBeInTheDocument();
  });

  it('does not show the camera switch button when only one video input device is available', () => {
    mockUsePublisherContext.mockReturnValue({
      publisherContext: { cycleVideo: vi.fn() } as unknown as PublisherContextType['publisher'],
      isVideoEnabled: true,
    } as unknown as PublisherContextType);

    // Set the store to have only one video device
    const singleVideoDevice = videoDevices[0];

    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: [...devices.filter((d) => d.kind !== 'videoinput'), singleVideoDevice],
    }));

    render(<SmallViewportHeader />);

    expect(screen.queryByTestId('vivid-icon-camera-switch-line')).not.toBeInTheDocument();

    // Restore full device list for subsequent tests
    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: devices,
    }));
  });

  it('toggles to the opposite camera device when clicked', async () => {
    const currentDeviceId = videoDevices[0].deviceId;
    const targetDeviceId = videoDevices[1].deviceId;

    const mockTrack = {
      getSettings: vi.fn(() => ({ deviceId: targetDeviceId })),
      stop: vi.fn(),
    } as unknown as MediaStreamTrack;

    const mockStream = makeMediaStreamMock({
      getVideoTracks: [mockTrack],
      getTracks: [mockTrack],
    });

    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        dispatchEvent: vi.fn().mockReturnValue(true),
        enumerateDevices: Promise.resolve(devices),
        getUserMedia: Promise.resolve(mockStream),
      },
    });

    // Allow getFacingMode to run without throwing (requires mobile)
    mockIsMobile.mockReturnValueOnce(true);

    const selectDeviceSpy = vi
      .spyOn(mediaDevices$.actions, 'selectDevice')
      .mockResolvedValue(undefined as never);

    mockUsePublisherContext.mockReturnValue({
      publisher: {
        getVideoSource: vi.fn().mockReturnValue({
          track: { getSettings: () => ({ facingMode: 'user' }) } as unknown as MediaStreamTrack,
          deviceId: currentDeviceId,
        }),
      } as unknown as PublisherContextType['publisher'],
      isVideoEnabled: true,
    } as unknown as PublisherContextType);

    render(<SmallViewportHeader />);

    const cameraIcon = screen.getByTestId('vivid-icon-camera-switch-line');
    fireEvent.click(cameraIcon);

    await waitFor(() => {
      expect(selectDeviceSpy).toHaveBeenCalledTimes(1);
      expect(selectDeviceSpy).toHaveBeenCalledWith('videoinput', targetDeviceId);
    });
  });
});

function render(
  component: React.ReactElement,
  sessionContext?: { initialValue?: { sessionKey?: string; archiveId?: string | null } }
) {
  const { wrapper } = makeTestProvider([providers.user, providers.session, providers.runtime], {
    userContext: undefined,
    sessionContext: {
      initialValue: {
        sessionKey: mockSessionKey,
        ...sessionContext?.initialValue,
      },
    },
    runtimeContext: undefined,
  });

  return renderBase(component, { wrapper });
}
