import { useState, useRef, useCallback } from 'react';
import {
  Publisher,
  VideoFilter,
  hasMediaProcessorSupport,
  PublisherProperties,
} from '@vonage/client-sdk-video';
import useSuspenseUntilAppConfigReady from '@Context/AppConfig/hooks/useSuspenseUntilAppConfigReady';
import useUserContext from '@hooks/useUserContext';
import { UserType } from '../../user';
import usePublisher, { ApplyBackgroundFilterParams } from '@Context/PublisherProvider/usePublisher';
import { setStorageItem, STORAGE_KEYS } from '@utils/storage';
import usePublisherMediaDeviceId from '@hooks/usePublisherMediaDevices';
import useStableCallback from '@hooks/useStableCallback';

export type PreviewPublisherContextType = {
  isAudioEnabled: boolean;
  isPublishing: boolean;
  isVideoEnabled: boolean;
  publisher: Publisher | null;
  publisherVideoElement: HTMLVideoElement | HTMLObjectElement | undefined;
  unpublish: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  changeBackground: (arg: ApplyBackgroundFilterParams) => Promise<void>;
  backgroundFilter: VideoFilter | undefined;
  localAudioSource: string | null;
  localVideoSource: string | null;
  changeAudioSource: (deviceId: string) => void;
  changeVideoSource: (deviceId: string) => void;
  initializeLocalPublisher: (options?: Partial<PublisherProperties>) => Publisher;
  speechLevel: number;
};

/**
 * Hook wrapper for creation, interaction with, and state for local video preview publisher.
 * Access from app via PreviewPublisherProvider, not directly.
 * @property {boolean} isAudioEnabled - React state boolean showing if audio is enabled
 * @property {boolean} isPublishing - React state boolean showing if we are publishing
 * @property {boolean} isVideoEnabled - React state boolean showing if camera is on
 * @property {Publisher | null} publisher - Publisher object
 * @property {HTMLVideoElement | HTMLObjectElement} publisherVideoElement - video element for publisher
 * @property {Function} destroyPublisher - Method to destroy publisher
 * @property {() => void} toggleAudio - Method to toggle microphone on/off. State updated internally, can be read via isAudioEnabled.
 * @property {() => void} toggleVideo - Method to toggle camera on/off. State updated internally, can be read via isVideoEnabled.
 * @property {Function} changeBackground - Method to change background effect
 * @property {VideoFilter | undefined} backgroundFilter - Current background filter applied to publisher
 * @property {string | undefined} localVideoSource - Current video source device ID
 * @property {string | undefined} localAudioSource - Current audio source device ID
 * @property {string | null} accessStatus - Current device access status
 * @property {Function} changeAudioSource - Method to change audio source device ID
 * @property {Function} changeVideoSource - Method to change video source device ID
 * @property {Function} initLocalPublisher - Method to initialize the preview publisher
 * @property {number} speechLevel - Current speech level for audio visualization
 * @returns {PreviewPublisherContextType} preview context
 */
const usePreviewPublisher = (): PreviewPublisherContextType => {
  useSuspenseUntilAppConfigReady();

  const { setUser, user } = useUserContext();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    initializeLocalPublisher: _initializeLocalPublisher,
    isAudioEnabled,
    // isForceMuted,
    isPublishing,
    // publishingError,
    isVideoEnabled,
    // publish,
    publisher,
    publisherVideoElement,
    // quality,
    // stream,
    toggleAudio: _toggleAudio,
    toggleVideo: _toggleVideo,
    changeBackground: _changeBackground,
    unpublish,
    // publisherOptions,
  } = usePublisher();

  const initialBackgroundRef = useRef<VideoFilter | undefined>(
    user.defaultSettings.backgroundFilter
  );

  const [speechLevel, setSpeechLevel] = useState(0);

  const [backgroundFilter, setBackgroundFilter] = useState<VideoFilter | undefined>(
    user.defaultSettings.backgroundFilter
  );

  const [localAudioSource, setLocalAudioSource] = usePublisherMediaDeviceId(
    publisher,
    'audioinput'
  );

  const [localVideoSource, setLocalVideoSource] = usePublisherMediaDeviceId(
    publisher,
    'videoinput'
  );

  /**
   * Change microphone
   * @returns {void}
   */
  const changeAudioSource = useCallback(
    (deviceId: string) => {
      if (!deviceId || !publisher) {
        return;
      }
      publisher.setAudioSource(deviceId);
      setLocalAudioSource(deviceId);
      setStorageItem(STORAGE_KEYS.AUDIO_SOURCE, deviceId);
      if (setUser) {
        setUser((prevUser: UserType) => ({
          ...prevUser,
          defaultSettings: { ...prevUser.defaultSettings, audioSource: deviceId },
        }));
      }
    },
    [publisher, setLocalAudioSource, setUser]
  );

  /**
   * Change video camera in use
   * @returns {void}
   */
  const changeVideoSource = useCallback(
    (deviceId: string) => {
      if (!deviceId || !publisher) {
        return;
      }
      publisher.setVideoSource(deviceId);
      setLocalVideoSource(deviceId);
      setStorageItem(STORAGE_KEYS.VIDEO_SOURCE, deviceId);
      if (setUser) {
        setUser((prevUser: UserType) => ({
          ...prevUser,
          defaultSettings: { ...prevUser.defaultSettings, videoSource: deviceId },
        }));
      }
    },
    [publisher, setLocalVideoSource, setUser]
  );

  /**
   * Turns the camera on and off
   * A wrapper for Publisher.publishVideo()
   * More details here: https://vonage.github.io/conversation-docs/video-js-reference/latest/Publisher.html#publishVideo
   * @returns {void}
   */
  const toggleVideo = () => {
    const newIsVideoEnabled = _toggleVideo();

    if (setUser) {
      setUser((prevUser: UserType) => ({
        ...prevUser,
        defaultSettings: { ...prevUser.defaultSettings, publishVideo: newIsVideoEnabled },
      }));
    }
  };

  /**
   * Turns the microphone on and off
   * A wrapper for Publisher.publishAudio()
   * More details here: https://vonage.github.io/conversation-docs/video-js-reference/latest/Publisher.html#publishAudio
   * @returns {void}
   */
  const toggleAudio = () => {
    const newIsAudioEnabled = _toggleAudio();

    if (setUser) {
      setUser((prevUser: UserType) => ({
        ...prevUser,
        defaultSettings: { ...prevUser.defaultSettings, publishAudio: newIsAudioEnabled },
      }));
    }
  };

  // Set videoFilter based on user's selected background
  const videoFilter =
    initialBackgroundRef.current && hasMediaProcessorSupport()
      ? initialBackgroundRef.current
      : undefined;

  const initializeLocalPublisher = useStableCallback((options?: Partial<PublisherProperties>) => {
    const publisher = _initializeLocalPublisher({ videoFilter, ...options });

    /* TODO: Replace with mvgAverage utils once merged */ // NOSONAR
    const calculateAudioLevel = (audioLevel: number) => {
      const currentLogLevel = Math.log(audioLevel) / Math.LN10 / 1.5 + 1;
      setSpeechLevel(Math.min(Math.max(currentLogLevel, 0), 1) * 100);
    };

    publisher.on('audioLevelUpdated', ({ audioLevel }: { audioLevel: number }) => {
      calculateAudioLevel(audioLevel);
    });

    return publisher;
  });

  /**
   * Change background replacement or blur effect
   * @param {string} backgroundSelected - The selected background option
   * @returns {void}
   */
  const changeBackground = useCallback(
    (args: ApplyBackgroundFilterParams) => {
      return _changeBackground({
        storeItem: undefined,
        setUser,
        setBackgroundFilter,
        ...args,
      }).catch(() => {
        console.error('Failed to apply background filter.');
      });
    },
    [_changeBackground, setUser]
  );

  return {
    isAudioEnabled,
    initializeLocalPublisher,
    isPublishing,
    isVideoEnabled,
    unpublish,
    publisher,
    publisherVideoElement,
    toggleAudio,
    toggleVideo,
    changeBackground,
    backgroundFilter,
    changeAudioSource,
    changeVideoSource,
    localAudioSource,
    localVideoSource,
    speechLevel,
  };
};
export default usePreviewPublisher;
