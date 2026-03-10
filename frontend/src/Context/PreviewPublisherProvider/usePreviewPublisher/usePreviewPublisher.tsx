import { useState, useRef, useCallback } from 'react';
import { initPublisher, hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import type { Event, Publisher, PublisherProperties, VideoFilter } from '@vonage/client-sdk-video';
import usePermissions from '../../../hooks/usePermissions';
import useUserContext from '../../../hooks/useUserContext';
import { DEVICE_ACCESS_STATUS } from '../../../utils/constants';
import { UserType } from '../../user';
import { AccessDeniedEvent } from '../../PublisherProvider/usePublisher/usePublisher';
import { setStorageItem, getStorageItem, STORAGE_KEYS } from '../../../utils/storage';
import applyBackgroundFilter from '../../../utils/backgroundFilter/applyBackgroundFilter/applyBackgroundFilter';
import handlePublisherAccessDenied from '../../../utils/publisher/handlePublisherAccessDenied';
import useStableCallback from '@web/hooks/useStableCallback';
import mediaDevices$ from '@core/stores/devices';
import useSyncPublisherDevices from '@Context/PublisherProvider/usePublisher/hooks/useSyncPublisherDevices/useSyncPublisherDevices';
import waitUntilPlaying from '@utils/waitUntilPlaying';
import { attempt } from '@common/execution';
import { useMountEffect } from '@web/hooks';
import { env } from '../../../env';

type PublisherVideoElementCreatedEvent = Event<'videoElementCreated', Publisher> & {
  element: HTMLVideoElement | HTMLObjectElement;
};

export type PreviewPublisherContextType = {
  isAudioEnabled: boolean;
  isPublishing: boolean;
  isVideoEnabled: boolean;
  publisher: Publisher | null;
  publisherVideoElement: HTMLVideoElement | HTMLObjectElement | undefined;
  destroyPublisher: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  changeBackground: (backgroundSelected: string) => Promise<void>;
  backgroundFilter: VideoFilter | undefined;
  accessStatus: string | null;
  changeAudioSource: (deviceId: string) => void;
  changeVideoSource: (deviceId: string) => void;
  initLocalPublisher: () => void;
  speechLevel: number;
  isVideoLoading: boolean;
};

export type PreviewPublisherInitialValue = Partial<
  Pick<
    PreviewPublisherContextType,
    | 'publisherVideoElement'
    | 'isAudioEnabled'
    | 'isPublishing'
    | 'isVideoEnabled'
    | 'speechLevel'
    | 'backgroundFilter'
    | 'accessStatus'
    | 'publisher'
  >
>;

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
const usePreviewPublisher = (
  initialValue?: PreviewPublisherInitialValue
): PreviewPublisherContextType => {
  const videoSourceId = mediaDevices$.useDeviceId('videoinput');
  const audioSourceId = mediaDevices$.useDeviceId('audioinput');

  const { setUser, user } = useUserContext();
  const [publisherVideoElement, setPublisherVideoElement] = useState<
    HTMLVideoElement | HTMLObjectElement | undefined
  >(initialValue?.publisherVideoElement ?? undefined);
  const [speechLevel, setSpeechLevel] = useState(initialValue?.speechLevel ?? 0);
  const { setAccessStatus, accessStatus } = usePermissions();
  const publisherRef = useRef<Publisher | null>(null);
  const [isPublishing, setIsPublishing] = useState<boolean>(initialValue?.isPublishing ?? false);
  const initialBackgroundRef = useRef<VideoFilter | undefined>(
    user.defaultSettings.backgroundFilter
  );
  const [backgroundFilter, setBackgroundFilter] = useState<VideoFilter | undefined>(
    () => initialValue?.backgroundFilter ?? user.defaultSettings.backgroundFilter
  );
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(
    () =>
      initialValue?.isVideoEnabled ?? getStorageItem(STORAGE_KEYS.VIDEO_SOURCE_ENABLED) !== 'false'
  );

  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(
    () =>
      initialValue?.isAudioEnabled ?? getStorageItem(STORAGE_KEYS.AUDIO_SOURCE_ENABLED) !== 'false'
  );

  const handlePreviewDestroyed = () => {
    publisherRef.current = null;
  };

  const [isVideoLoading, setIsVideoLoading] = useState(isVideoEnabled);

  // Sync publisher with selected devices from store (handles device changes and disconnections)
  useSyncPublisherDevices(publisherRef, { setIsAudioEnabled, setIsVideoEnabled });

  /**
   * Change background replacement or blur effect
   * @param {string} backgroundSelected - The selected background option
   * @returns {void}
   */
  const changeBackground = useCallback(
    (backgroundSelected: string) => {
      return applyBackgroundFilter({
        publisher: publisherRef.current,
        backgroundSelected,
        setUser,
        setBackgroundFilter,
      }).catch(() => {
        console.error('Failed to apply background filter.');
      });
    },
    [setBackgroundFilter, setUser]
  );

  /**
   * Change microphone
   * @returns {void}
   */
  const changeAudioSource = useCallback(
    (deviceId: string) => {
      if (!deviceId || !publisherRef.current) {
        return;
      }

      void publisherRef.current.setAudioSource(deviceId);
      void mediaDevices$.actions.selectDevice('audioinput', deviceId);

      if (setUser) {
        setUser((prevUser: UserType) => ({
          ...prevUser,
          defaultSettings: { ...prevUser.defaultSettings, audioSource: deviceId },
        }));
      }
    },
    [setUser]
  );

  /**
   * Change video camera in use
   * @returns {void}
   */
  const changeVideoSource = useCallback(
    (deviceId: string) => {
      if (!deviceId || !publisherRef.current) {
        return;
      }

      void publisherRef.current.setVideoSource(deviceId);
      void mediaDevices$.actions.selectDevice('videoinput', deviceId);

      if (setUser) {
        setUser((prevUser: UserType) => ({
          ...prevUser,
          defaultSettings: { ...prevUser.defaultSettings, videoSource: deviceId },
        }));
      }
    },
    [setUser]
  );

  const handleAccessDenied = useCallback(
    async (event: AccessDeniedEvent) => {
      await handlePublisherAccessDenied(event, setAccessStatus);
    },
    [setAccessStatus]
  );

  const handleVideoElementCreated = (event: PublisherVideoElementCreatedEvent) => {
    setPublisherVideoElement(event.element);
    setIsPublishing(true);

    event.element.classList.add('video__element');
    event.element.title = 'publisher-preview';

    if (!isVideoLoading) return;

    void waitUntilPlaying(event.element).then(() => {
      setIsVideoLoading(false);
    });
  };

  /* TODO: Replace with mvgAverage utils once merged */ // NOSONAR
  const calculateAudioLevel = useCallback((audioLevel: number) => {
    const currentLogLevel = Math.log(audioLevel) / Math.LN10 / 1.5 + 1;
    setSpeechLevel(Math.min(Math.max(currentLogLevel, 0), 1) * 100);
  }, []);

  const addPublisherListeners = useStableCallback((publisher: Publisher | null) => {
    if (!publisher) {
      return;
    }
    publisher.on('destroyed', handlePreviewDestroyed);
    publisher.on('accessDenied', handleAccessDenied);
    publisher.on('videoElementCreated', handleVideoElementCreated);
    publisher.on('audioLevelUpdated', ({ audioLevel }: { audioLevel: number }) => {
      calculateAudioLevel(audioLevel);
    });
    publisher.on('accessAllowed', () => {
      setAccessStatus(DEVICE_ACCESS_STATUS.ACCEPTED);
    });
  });

  const initLocalPublisher = useStableCallback(() => {
    if (publisherRef.current) {
      return;
    }

    // Set videoFilter based on user's selected background
    let videoFilter: VideoFilter | undefined;
    if (initialBackgroundRef.current && hasMediaProcessorSupport()) {
      videoFilter = initialBackgroundRef.current;
    }

    const publisherOptions: PublisherProperties = {
      insertDefaultUI: false,
      videoFilter,
      resolution: env.DEFAULT_RESOLUTION,
      publishAudio: isAudioEnabled,
      publishVideo: isVideoEnabled,
      audioSource: audioSourceId,
      videoSource: videoSourceId,
    };

    publisherRef.current = initPublisher(undefined, publisherOptions, (err: unknown) => {
      if (err instanceof Error) {
        publisherRef.current = null;
        if (err.name === 'OT_USER_MEDIA_ACCESS_DENIED') {
          console.error('initPublisher error: ', err);
        }
      }
    });
    addPublisherListeners(publisherRef.current);
  });

  /**
   * Destroys the preview publisher
   * @returns {void}
   */
  const destroyPublisher = useCallback(() => {
    if (publisherRef.current) {
      attempt(() => {
        // There is a known race condition in Firefox during navigation where the DOM elements are destroyed before the publisher is destroyed, causing OT to throw an error.
        publisherRef.current?.destroy();
      });
    } else {
      console.error('pub not destroyed');
    }

    publisherRef.current = null;
  }, []);

  /**
   * Turns the camera on and off
   * A wrapper for Publisher.publishVideo()
   * More details here: https://vonage.github.io/conversation-docs/video-js-reference/latest/Publisher.html#publishVideo
   * @returns {void}
   */
  const toggleVideo = () => {
    if (!publisherRef.current) {
      return;
    }

    publisherRef.current.publishVideo(!isVideoEnabled);
    setStorageItem(STORAGE_KEYS.VIDEO_SOURCE_ENABLED, (!isVideoEnabled).toString());
    setIsVideoEnabled(!isVideoEnabled);
    if (setUser) {
      setUser((prevUser: UserType) => ({
        ...prevUser,
        defaultSettings: { ...prevUser.defaultSettings, publishVideo: !isVideoEnabled },
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
    if (!publisherRef.current) {
      return;
    }
    publisherRef.current.publishAudio(!isAudioEnabled);
    setIsAudioEnabled(!isAudioEnabled);
    setStorageItem(STORAGE_KEYS.AUDIO_SOURCE_ENABLED, (!isAudioEnabled).toString());
    if (setUser) {
      setUser((prevUser: UserType) => ({
        ...prevUser,
        defaultSettings: { ...prevUser.defaultSettings, publishAudio: !isAudioEnabled },
      }));
    }
  };

  useMountEffect(() => {
    return () => {
      destroyPublisher();
    };
  });

  return {
    isAudioEnabled,
    initLocalPublisher,
    isPublishing,
    isVideoEnabled,
    destroyPublisher,

    publisher: publisherRef.current,
    publisherVideoElement,
    toggleAudio,
    toggleVideo,
    changeBackground,
    backgroundFilter,
    changeAudioSource,
    changeVideoSource,
    accessStatus,
    speechLevel,
    isVideoLoading,
  };
};
export default usePreviewPublisher;
