import { describe, it, expect, vi, beforeEach, Mock, afterEach, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Publisher } from '@vonage/client-sdk-video';
import { EventEmitter } from 'stream';
import { PublisherContextType } from '../../../Context/PublisherProvider';
import { defaultAudioDevice } from '../../../utils/mockData/device';
import useSpeakingDetector from '../../../hooks/useSpeakingDetector';
import usePublisherContext from '../../../hooks/usePublisherContext';
import DeviceControlButton from './DeviceControlButton';

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

const mockUsePublisherContext = usePublisherContext as Mock<[], PublisherContextType>;
const mockUseSpeakingDetector = useSpeakingDetector as Mock<[], boolean>;
const mockHandleToggleBackgroundEffects = vi.fn();

describe('DeviceControlButton', () => {
  const nativeMediaDevices = global.navigator.mediaDevices;
  let mockPublisher: Publisher;
  let publisherContext: PublisherContextType;
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

  it('renders the video control button', () => {
    render(
      <DeviceControlButton
        deviceType="video"
        toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
      />
    );
    expect(screen.getByLabelText('camera')).toBeInTheDocument();
    expect(screen.getByTestId('ArrowDropUpIcon')).toBeInTheDocument();
  });

  it('renders the audio control button', () => {
    render(
      <DeviceControlButton
        deviceType="audio"
        toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
      />
    );
    expect(screen.getByLabelText('microphone')).toBeInTheDocument();
    expect(screen.getByTestId('ArrowDropUpIcon')).toBeInTheDocument();
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
});
