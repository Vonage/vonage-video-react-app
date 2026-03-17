import { vi, describe, it, Mock, expect, beforeEach, beforeAll, afterEach } from 'vitest';
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
import { isAndroid } from '@utils/util';
import { resolveMobileVideoSource } from '@utils/cameraSwitch';
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

vi.mock('@utils/util', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@utils/util')>();
  return { ...actual, isAndroid: vi.fn(() => false) };
});

vi.mock('@utils/cameraSwitch', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@utils/cameraSwitch')>();
  return {
    ...actual,
    resolveMobileVideoSource: vi.fn((deviceId: string) => Promise.resolve(deviceId)),
  };
});

vi.mock('@common/execution/wait', () => ({ default: vi.fn(() => Promise.resolve()) }));

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
      publisherContext: { cycleVideo: vi.fn() } as unknown as PublisherContextType['publisher'],
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

    expect(screen.getByTestId('RadioButtonCheckedIcon')).toBeInTheDocument();
  });

  it('does not show the recording icon if it there is not one happening', () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });

    render(<SmallViewportHeader />);

    expect(screen.queryByTestId('vivid-icon-radio-checked-2-solid')).not.toBeInTheDocument();
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
      publisherContext: { cycleVideo: vi.fn() } as unknown as PublisherContextType['publisher'],
      isVideoEnabled: true,
    } as unknown as PublisherContextType);

    render(<SmallViewportHeader />);

    expect(screen.getByTestId('vivid-icon-camera-switch-line')).toBeInTheDocument();
  });

  it('does not show the camera switch button when video is disabled', () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });
    mockUsePublisherContext.mockReturnValue({
      publisherContext: { cycleVideo: vi.fn() } as unknown as PublisherContextType['publisher'],
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

  it('toggles to the opposite camera device when clicked', async () => {
    const videoInputDevice1 = videoDevices[0];

    (useSessionContext as Mock).mockReturnValue({ archiveId: null });
    const setVideoSource = vi.fn();
    const getVideoSource = vi.fn(() => ({
      deviceId: videoInputDevice1.deviceId,
      label: videoInputDevice1.label,
      kind: 'videoInput',
    }));

    mockUsePublisherContext.mockReturnValue({
      publisher: {
        setVideoSource,
        getVideoSource,
      } as unknown as PublisherContextType['publisher'],
      isVideoEnabled: true,
    } as unknown as PublisherContextType);

    render(<SmallViewportHeader />);
    const cameraIcon = screen.getByTestId('vivid-icon-camera-switch-line');
    fireEvent.click(cameraIcon);

    await waitFor(() => {
      expect(setVideoSource).toHaveBeenCalledTimes(1);
      expect(setVideoSource).toHaveBeenCalledWith(videoDevices[1].deviceId);
    });
  });

  describe('camera toggle - Android', () => {
    const videoInputDevice1 = videoDevices[0];
    const videoInputDevice2 = videoDevices[1];
    let publishVideo: Mock;
    let setVideoSource: Mock;

    beforeEach(() => {
      vi.mocked(isAndroid).mockReturnValue(true);
      vi.mocked(resolveMobileVideoSource).mockResolvedValue('resolved-device-id');
      (useSessionContext as Mock).mockReturnValue({ archiveId: null });

      publishVideo = vi.fn();
      setVideoSource = vi.fn().mockResolvedValue(undefined);

      mockUsePublisherContext.mockReturnValue({
        publisher: {
          setVideoSource,
          publishVideo,
          getVideoSource: vi.fn(() => ({
            deviceId: videoInputDevice1.deviceId,
            label: videoInputDevice1.label,
            kind: 'videoInput',
          })),
        } as unknown as PublisherContextType['publisher'],
        isVideoEnabled: true,
      } as unknown as PublisherContextType);
    });

    afterEach(() => {
      vi.mocked(isAndroid).mockReturnValue(false);
    });

    it('calls publishVideo(false) before resolving the camera on Android', async () => {
      const callOrder: string[] = [];
      publishVideo.mockImplementation(() => callOrder.push('publishVideo'));
      vi.mocked(resolveMobileVideoSource).mockImplementation((deviceId) => {
        callOrder.push('resolve');
        return Promise.resolve(deviceId);
      });

      render(<SmallViewportHeader />);
      fireEvent.click(screen.getByTestId('vivid-icon-camera-switch-line'));

      await waitFor(() => expect(callOrder).toContain('resolve'));

      expect(callOrder[0]).toBe('publishVideo');
      expect(publishVideo).toHaveBeenCalledWith(false);
    });

    it('re-enables video after switching on Android', async () => {
      render(<SmallViewportHeader />);
      fireEvent.click(screen.getByTestId('vivid-icon-camera-switch-line'));

      await waitFor(() => {
        expect(publishVideo).toHaveBeenCalledWith(false);
        expect(publishVideo).toHaveBeenCalledWith(true);
      });
    });

    it('updates device store with the resolved deviceId after toggle', async () => {
      render(<SmallViewportHeader />);
      fireEvent.click(screen.getByTestId('vivid-icon-camera-switch-line'));

      await waitFor(() => {
        expect(mediaDevices$.actions.selectDevice).toHaveBeenCalledWith(
          'videoinput',
          'resolved-device-id'
        );
      });
    });

    it('calls setVideoSource with the resolved deviceId', async () => {
      render(<SmallViewportHeader />);
      fireEvent.click(screen.getByTestId('vivid-icon-camera-switch-line'));

      await waitFor(() => {
        expect(setVideoSource).toHaveBeenCalledWith('resolved-device-id');
      });
    });

    it('does not call publishVideo on non-Android', async () => {
      vi.mocked(isAndroid).mockReturnValue(false);
      // reset to pass-through so we can assert on the raw deviceId
      vi.mocked(resolveMobileVideoSource).mockImplementation((id) => Promise.resolve(id));

      render(<SmallViewportHeader />);
      fireEvent.click(screen.getByTestId('vivid-icon-camera-switch-line'));

      await waitFor(() => {
        expect(setVideoSource).toHaveBeenCalledWith(videoInputDevice2.deviceId);
      });

      expect(publishVideo).not.toHaveBeenCalled();
    });
  });
});
