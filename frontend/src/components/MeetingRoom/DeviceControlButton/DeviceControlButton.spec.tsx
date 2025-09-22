import { describe, it, expect, vi, beforeEach, Mock, afterEach, afterAll } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Publisher } from '@vonage/client-sdk-video';
import { EventEmitter } from 'stream';
import { PublisherContextType } from '../../../Context/PublisherProvider';
import { defaultAudioDevice } from '../../../utils/mockData/device';
import useSpeakingDetector from '../../../hooks/useSpeakingDetector';
import usePublisherContext from '../../../hooks/usePublisherContext';
import DeviceControlButton from './DeviceControlButton';
import useConfigContext from '../../../hooks/useConfigContext';
import { ConfigContextType } from '../../../Context/ConfigProvider';

vi.mock('../../../hooks/usePublisherContext.tsx');
vi.mock('../../../hooks/useSpeakingDetector.tsx');
const toggleBackgroundVideoPublisherMock = vi.fn();
vi.mock('../../../hooks/useBackgroundPublisherContext', () => {
  return {
    default: () => ({
      toggleVideo: toggleBackgroundVideoPublisherMock,
    }),
  };
});
vi.mock('../../../hooks/useConfigContext');

const mockUsePublisherContext = usePublisherContext as Mock<[], PublisherContextType>;
const mockUseSpeakingDetector = useSpeakingDetector as Mock<[], boolean>;
const mockHandleToggleBackgroundEffects = vi.fn();
const mockUseConfigContext = useConfigContext as Mock<[], ConfigContextType>;

describe('DeviceControlButton', () => {
  const nativeMediaDevices = global.navigator.mediaDevices;
  let mockPublisher: Publisher;
  let publisherContext: PublisherContextType;
  let configContext: ConfigContextType;

  beforeEach(() => {
    mockPublisher = Object.assign(new EventEmitter(), {
      applyVideoFilter: vi.fn(),
      clearVideoFilter: vi.fn(),
      getAudioSource: () => defaultAudioDevice,
      videoWidth: () => 1280,
      videoHeight: () => 720,
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
    mockUseSpeakingDetector.mockReturnValue(false);

    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        enumerateDevices: vi.fn(
          () =>
            new Promise<MediaDeviceInfo[]>((res) => {
              res([]);
            })
        ),
        addEventListener: vi.fn(() => []),
        removeEventListener: vi.fn(() => []),
      },
    });

    configContext = {
      audioSettings: {
        allowMicrophoneControl: true,
      },
      videoSettings: {
        allowCameraControl: true,
      },
    } as unknown as ConfigContextType;
    mockUseConfigContext.mockReturnValue(configContext);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  afterAll(() => {
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: nativeMediaDevices,
    });
  });

  it('updates the main publisher and the background replacement publisher when clicked', () => {
    const toggleVideoMock = vi.fn();
    mockUsePublisherContext.mockImplementation(() => ({
      ...publisherContext,
      toggleAudio: vi.fn(),
      toggleVideo: toggleVideoMock,
      isAudioEnabled: true,
      isVideoEnabled: true,
    }));
    render(
      <DeviceControlButton
        deviceType="video"
        toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
      />
    );
    const cameraButton = screen.getByLabelText('camera');
    cameraButton.click();
    expect(toggleVideoMock).toHaveBeenCalled();
    expect(toggleBackgroundVideoPublisherMock).toHaveBeenCalled();
  });

  describe('audio DeviceControlButton', () => {
    it('renders by default', () => {
      render(
        <DeviceControlButton
          deviceType="audio"
          toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
        />
      );
      const micButton = screen.getByLabelText('microphone');
      expect(micButton).toBeInTheDocument();
      expect(micButton).not.toBeDisabled();

      expect(screen.getByTestId('ArrowDropUpIcon')).toBeInTheDocument();
    });

    it('renders the button as disabled with greyed out icon and correct tooltip when allowMicrophoneControl is false', async () => {
      configContext.audioSettings.allowMicrophoneControl = false;
      render(
        <DeviceControlButton
          deviceType="audio"
          toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
        />
      );
      const micButton = screen.getByLabelText('microphone');
      expect(micButton).toBeInTheDocument();
      expect(micButton).toBeDisabled();

      const tooltip = screen.getByLabelText('device settings');
      fireEvent.mouseOver(tooltip);
      expect(
        await screen.findByText('Microphone control is disabled in this application')
      ).toBeInTheDocument();
    });
  });

  describe('video DeviceControlButton', () => {
    it('is rendered when it is configured to be enabled', () => {
      render(
        <DeviceControlButton
          deviceType="video"
          toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
        />
      );

      const videoButton = screen.getByLabelText('camera');
      expect(videoButton).toBeInTheDocument();
      expect(videoButton).not.toBeDisabled();

      expect(screen.getByTestId('ArrowDropUpIcon')).toBeInTheDocument();
    });

    it('renders the button as disabled with greyed out icon and correct tooltip when allowCameraControl is false', async () => {
      configContext.videoSettings.allowCameraControl = false;
      render(
        <DeviceControlButton
          deviceType="video"
          toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
        />
      );

      const videoButton = screen.getByLabelText('camera');
      expect(videoButton).toBeInTheDocument();
      expect(videoButton).toBeDisabled();

      const tooltip = screen.getByLabelText('device settings');
      fireEvent.mouseOver(tooltip);
      expect(
        await screen.findByText('Camera control is disabled in this application')
      ).toBeInTheDocument();
    });
  });
});
