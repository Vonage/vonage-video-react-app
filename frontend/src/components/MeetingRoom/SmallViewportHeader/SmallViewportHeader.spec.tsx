import { vi, describe, it, Mock, expect, beforeEach, beforeAll } from 'vitest';
import {
  makeMediaDeviceInfos,
  makeMediaStreamMock,
  setupWindowNavigatorMock,
} from '@web-test/fixtures';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import useSessionContext from '@hooks/useSessionContext';
import useRoomName from '@hooks/useRoomName';
import useRoomShareUrl from '@hooks/useRoomShareUrl';
import usePublisherContext from '@hooks/usePublisherContext';
import { PublisherContextType } from '@Context/PublisherProvider';
import mediaDevices$ from '@core/stores/devices';
import SmallViewportHeader from './SmallViewportHeader';

vi.mock('@hooks/useSessionContext');
vi.mock('@hooks/useRoomName');
vi.mock('@hooks/useRoomShareUrl');
vi.mock('@hooks/usePublisherContext');
vi.mock('@web/platform', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@web/platform')>();
  return {
    ...actual,
    isMobile: () => false,
  };
});

const mockUsePublisherContext = usePublisherContext as Mock<[], PublisherContextType>;

const devices = makeMediaDeviceInfos();
const videoDevices = devices.filter((d) => d.kind === 'videoinput');

describe('SmallViewportHeader component', () => {
  const mockedRoomName = 'test-room-name';
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
    (useRoomName as Mock).mockReturnValue(mockedRoomName);
    (useRoomShareUrl as Mock).mockReturnValue('https://example.com/room/test-room-name');

    publisherContext = {
      publisher: null,
      isVideoEnabled: true,
    } as unknown as PublisherContextType;

    mockUsePublisherContext.mockReturnValue(publisherContext);

    // Initialize the store with video devices
    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: devices,
    }));

    vi.spyOn(mediaDevices$.actions, 'selectDevice').mockResolvedValue(undefined);
  });

  it('renders the room name', () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });

    render(<SmallViewportHeader />);

    expect(screen.getByText(mockedRoomName)).toBeInTheDocument();
  });

  it('shows the recording icon if it is currently in progress', () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: '123-456' });

    render(<SmallViewportHeader />);

    expect(screen.getByTestId('recordingIndicator')).toBeInTheDocument();
  });

  it('does not show the recording icon if it there is not one happening', () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });

    render(<SmallViewportHeader />);

    expect(screen.queryByTestId('recordingIndicator')).not.toBeInTheDocument();
  });

  it('copies room share URL to clipboard', async () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });
    render(<SmallViewportHeader />);

    const copyButton = screen.getByTestId('vivid-icon-copy-line');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'https://example.com/room/test-room-name'
      );
      expect(screen.getByTestId('vivid-icon-check-sent-line')).toBeInTheDocument();
    });
  });

  it('shows the camera switch button when video is enabled', () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });
    mockUsePublisherContext.mockReturnValue({
      publisher: null,
      isVideoEnabled: true,
    } as unknown as PublisherContextType);

    render(<SmallViewportHeader />);

    expect(screen.getByTestId('vivid-icon-camera-switch-line')).toBeInTheDocument();
  });

  it('does not show the camera switch button when video is disabled', () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });
    mockUsePublisherContext.mockReturnValue({
      publisher: null,
      isVideoEnabled: false,
    } as unknown as PublisherContextType);

    render(<SmallViewportHeader />);

    expect(screen.queryByTestId('vivid-icon-camera-switch-line')).not.toBeInTheDocument();
  });

  it('does not show the camera switch button when only one video input device is available', () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });

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
  });

  it('toggles to the rear camera on first click', async () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });
    const setVideoSource = vi.fn().mockResolvedValue(undefined);

    const frontCamera = {
      deviceId: 'front-camera',
      kind: 'videoinput' as MediaDeviceKind,
      label: 'camera 1, facing front',
      groupId: 'group-front',
      toJSON: () => ({
        deviceId: 'front-camera',
        kind: 'videoinput' as MediaDeviceKind,
        label: 'camera 1, facing front',
        groupId: 'group-front',
      }),
    } as MediaDeviceInfo;
    const rearCamera = {
      deviceId: 'rear-camera',
      kind: 'videoinput' as MediaDeviceKind,
      label: 'camera 0, facing back',
      groupId: 'group-rear',
      toJSON: () => ({
        deviceId: 'rear-camera',
        kind: 'videoinput' as MediaDeviceKind,
        label: 'camera 0, facing back',
        groupId: 'group-rear',
      }),
    } as MediaDeviceInfo;

    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: [...devices.filter((d) => d.kind !== 'videoinput'), frontCamera, rearCamera],
    }));

    mockUsePublisherContext.mockReturnValue({
      publisher: { setVideoSource } as unknown as PublisherContextType['publisher'],
      isVideoEnabled: true,
    } as unknown as PublisherContextType);

    render(<SmallViewportHeader />);
    fireEvent.click(screen.getByTestId('vivid-icon-camera-switch-line'));

    await waitFor(() => {
      expect(setVideoSource).toHaveBeenCalledWith(rearCamera.deviceId);
    });
  });

  it('toggles back to front camera on second click', async () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });
    const setVideoSource = vi.fn().mockResolvedValue(undefined);

    const frontCamera = {
      deviceId: 'front-camera',
      kind: 'videoinput' as MediaDeviceKind,
      label: 'camera 1, facing front',
      groupId: 'group-front',
      toJSON: () => ({
        deviceId: 'front-camera',
        kind: 'videoinput' as MediaDeviceKind,
        label: 'camera 1, facing front',
        groupId: 'group-front',
      }),
    } as MediaDeviceInfo;
    const rearCamera = {
      deviceId: 'rear-camera',
      kind: 'videoinput' as MediaDeviceKind,
      label: 'camera 0, facing back',
      groupId: 'group-rear',
      toJSON: () => ({
        deviceId: 'rear-camera',
        kind: 'videoinput' as MediaDeviceKind,
        label: 'camera 0, facing back',
        groupId: 'group-rear',
      }),
    } as MediaDeviceInfo;

    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: [...devices.filter((d) => d.kind !== 'videoinput'), frontCamera, rearCamera],
    }));

    mockUsePublisherContext.mockReturnValue({
      publisher: { setVideoSource } as unknown as PublisherContextType['publisher'],
      isVideoEnabled: true,
    } as unknown as PublisherContextType);

    render(<SmallViewportHeader />);
    const cameraIcon = screen.getByTestId('vivid-icon-camera-switch-line');

    fireEvent.click(cameraIcon);
    await waitFor(() => expect(setVideoSource).toHaveBeenCalledWith(rearCamera.deviceId));

    fireEvent.click(cameraIcon);
    await waitFor(() => expect(setVideoSource).toHaveBeenCalledWith(frontCamera.deviceId));
  });
});
