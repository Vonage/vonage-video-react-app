import { describe, it, expect, vi, beforeEach, Mock, afterEach } from 'vitest';
import { fireEvent, screen, render as renderBase } from '@testing-library/react';
import { Publisher } from '@vonage/client-sdk-video';
import { EventEmitter } from 'stream';
import { ReactElement } from 'react';
import { PublisherContextType } from '@Context/PublisherProvider';
import useSpeakingDetector from '@hooks/useSpeakingDetector';
import usePublisherContext from '@hooks/usePublisherContext';
import { defaultAudioDevice } from '@utils/mockData/device';
import { makeTestProvider } from '@test/providers';
import DeviceControlButton from './DeviceControlButton';
import { env } from '../../../env';
import enTranslations from '../../../locales/en.json';
import { setupWindowNavigatorMock } from '@web-test/fixtures';

vi.mock('@hooks/usePublisherContext.tsx');
vi.mock('@hooks/useSpeakingDetector.tsx');
const toggleBackgroundVideoPublisherMock = vi.fn();
vi.mock('@hooks/useBackgroundPublisherContext', () => {
  return {
    default: () => ({
      toggleVideo: toggleBackgroundVideoPublisherMock,
    }),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'devices.audio.microphone.full': enTranslations['devices.audio.microphone.full'],
        'devices.video.camera.full': enTranslations['devices.video.camera.full'],
        'devices.settings.ariaLabel': enTranslations['devices.settings.ariaLabel'],
        'devices.video.disabled': enTranslations['devices.video.disabled'],
        'devices.audio.disabled': enTranslations['devices.audio.disabled'],
        'mutedAlert.message.muted': enTranslations['mutedAlert.message.muted'],
      };
      return translations[key] || key;
    },
  }),
}));

const mockUsePublisherContext = usePublisherContext as Mock<[], PublisherContextType>;
const mockUseSpeakingDetector = useSpeakingDetector as Mock<[], boolean>;
const mockHandleToggleBackgroundEffects = vi.fn();

describe('DeviceControlButton', () => {
  let mockPublisher: Publisher;
  let publisherContext: PublisherContextType;

  beforeEach(() => {
    env.partialUpdate({
      ALLOW_MICROPHONE_CONTROL: true,
      ALLOW_CAMERA_CONTROL: true,
    });
    mockPublisher = Object.assign(new EventEmitter(), {
      applyVideoFilter: vi.fn(),
      clearVideoFilter: vi.fn(),
      getAudioSource: () => defaultAudioDevice,
      videoWidth: () => 1280,
      videoHeight: () => 720,
    }) as unknown as Publisher;
    publisherContext = {
      publisherContext: null,
      isPublishing: true,
      publish: vi.fn() as () => Promise<void>,
      initializeLocalPublisher: vi.fn(() => {
        publisherContext.publisher = mockPublisher;
      }) as unknown as () => void,
    } as unknown as PublisherContextType;
    mockUsePublisherContext.mockImplementation(() => publisherContext);
    mockUseSpeakingDetector.mockReturnValue(false);

    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve([]),
      },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
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
    const cameraButton = screen.getByLabelText('Camera');
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
      const micButton = screen.getByLabelText('Microphone');
      expect(micButton).toBeInTheDocument();
      expect(micButton).not.toBeDisabled();

      expect(screen.getByTestId('vivid-icon-chevron-up-line')).toBeInTheDocument();
    });

    it('renders the button as disabled with greyed out icon and correct tooltip when allowMicrophoneControl is false', async () => {
      env.partialUpdate({
        ALLOW_MICROPHONE_CONTROL: false,
        ALLOW_CAMERA_CONTROL: true,
      });

      render(
        <DeviceControlButton
          deviceType="audio"
          toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
        />
      );
      const micButton = screen.getByLabelText('Microphone');
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

      const videoButton = screen.getByLabelText('Camera');
      expect(videoButton).toBeInTheDocument();
      expect(videoButton).not.toBeDisabled();

      expect(screen.getByTestId('vivid-icon-chevron-up-line')).toBeInTheDocument();
    });

    it('renders the button as disabled with greyed out icon and correct tooltip when allowCameraControl is false', async () => {
      env.partialUpdate({
        ALLOW_MICROPHONE_CONTROL: true,
        ALLOW_CAMERA_CONTROL: false,
      });

      render(
        <DeviceControlButton
          deviceType="video"
          toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
        />
      );

      const videoButton = screen.getByLabelText('Camera');
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

function render(ui: ReactElement) {
  const { wrapper, ...context } = makeTestProvider([]);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
