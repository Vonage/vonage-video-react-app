import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Publisher,
  Event,
  initPublisher,
  VideoFilter,
  hasMediaProcessorSupport,
  PublisherProperties,
} from '@vonage/client-sdk-video';
import setMediaDevices from '@utils/mediaDeviceUtils';
import useDevices from '@hooks/useDevices';
import usePermissions from '@hooks/usePermissions';
import useUserContext from '@hooks/useUserContext';
import { DEVICE_ACCESS_STATUS } from '@utils/constants';
import DeviceStore from '@utils/DeviceStore';
import { setStorageItem, STORAGE_KEYS } from '@utils/storage';
import applyBackgroundFilter from '@utils/backgroundFilter/applyBackgroundFilter/applyBackgroundFilter';
import useConfigContext from '@hooks/useConfigContext';
import useIsCameraControlAllowed from '@hooks/useIsCameraControlAllowed';
import useIsMicrophoneControlAllowed from '@hooks/useIsMicrophoneControlAllowed';
import type { UserType } from '@Context/user';
import type { AccessDeniedEvent } from '@Context/PublisherProvider/usePublisher/usePublisher';
import useSyncMediaPermissions from './useSyncMediaPermissions';

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
  changeBackground: (backgroundSelected: string) => void;
  backgroundFilter: VideoFilter | undefined;
  localAudioSource: string | undefined;
  localVideoSource: string | undefined;
  accessStatus: string | null;
  changeAudioSource: (deviceId: string) => void;
  changeVideoSource: (deviceId: string) => void;
  initLocalPublisher: () => Promise<void>;
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
  const isCameraControlAllowed = useIsCameraControlAllowed();
  const isMicrophoneControlAllowed = useIsMicrophoneControlAllowed();

  const { setUser, user } = useUserContext();
  const defaultResolution = useConfigContext(
    ({ videoSettings }) => videoSettings.defaultResolution
  );
  const { allMediaDevices, getAllMediaDevices } = useDevices();
  const [publisherVideoElement, setPublisherVideoElement] = useState<
    HTMLVideoElement | HTMLObjectElement
  >();
  const [speechLevel, setSpeechLevel] = useState(0);
  const { setAccessStatus, accessStatus } = usePermissions();
  const publisherRef = useRef<Publisher | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const initialBackgroundRef = useRef<VideoFilter | undefined>(
    user.defaultSettings.backgroundFilter
  );
  const [backgroundFilter, setBackgroundFilter] = useState<VideoFilter | undefined>(
    user.defaultSettings.backgroundFilter
  );
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [localVideoSource, setLocalVideoSource] = useState<string | undefined>(undefined);
  const [localAudioSource, setLocalAudioSource] = useState<string | undefined>(undefined);
  const deviceStoreRef = useRef<DeviceStore>(new DeviceStore());

  useSyncMediaPermissions({
    setIsVideoEnabled,
    setIsAudioEnabled,
    isCameraControlAllowed,
    isMicrophoneControlAllowed,
  });

  /* This sets the default devices in use so that the user knows what devices they are using */
  useEffect(() => {
    setMediaDevices(publisherRef, allMediaDevices, setLocalAudioSource, setLocalVideoSource);
  }, [allMediaDevices]);

  const handlePreviewDestroyed = () => {
    publisherRef.current = null;
  };

  /**
   * Change background replacement or blur effect
   * @param {string} backgroundSelected - The selected background option
   * @returns {void}
   */
  const changeBackground = useCallback(
    (backgroundSelected: string) => {
      applyBackgroundFilter({
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
      publisherRef.current.setAudioSource(deviceId);
      setLocalAudioSource(deviceId);
      setStorageItem(STORAGE_KEYS.AUDIO_SOURCE, deviceId);
      if (setUser) {
        setUser((prevUser: UserType) => ({
          ...prevUser,
          defaultSettings: {
            ...prevUser.defaultSettings,
            audioSource: deviceId,
          },
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
      publisherRef.current.setVideoSource(deviceId);
      setLocalVideoSource(deviceId);
      setStorageItem(STORAGE_KEYS.VIDEO_SOURCE, deviceId);
      if (setUser) {
        setUser((prevUser: UserType) => ({
          ...prevUser,
          defaultSettings: {
            ...prevUser.defaultSettings,
            videoSource: deviceId,
          },
        }));
      }
    },
    [setUser]
  );

  /**
   * Handle device permissions denial
   * used to inform the user they need to give permissions to devices to access the call
   * after a user grants permissions to the denied device, trigger a reload.
   * @returns {void}
   */
  const handleAccessDenied = useCallback(
    async (event: AccessDeniedEvent) => {
      const deviceDeniedAccess = event.message?.startsWith('Microphone') ? 'microphone' : 'camera';

      setAccessStatus(DEVICE_ACCESS_STATUS.REJECTED);

      try {
        const permissionStatus = await window.navigator.permissions.query({
          name: deviceDeniedAccess,
        });
        permissionStatus.onchange = () => {
          if (permissionStatus.state === 'granted') {
            setAccessStatus(DEVICE_ACCESS_STATUS.ACCESS_CHANGED);
          }
        };
      } catch (error) {
        console.error(`Failed to query device permission for ${deviceDeniedAccess}: ${error}`);
      }
    },
    [setAccessStatus]
  );

  const handleVideoElementCreated = (event: PublisherVideoElementCreatedEvent) => {
    setPublisherVideoElement(event.element);
    setIsPublishing(true);
  };

  /* TODO: Replace with mvgAverage utils once merged */ // NOSONAR
  const calculateAudioLevel = useCallback((audioLevel: number) => {
    const currentLogLevel = Math.log(audioLevel) / Math.LN10 / 1.5 + 1;
    setSpeechLevel(Math.min(Math.max(currentLogLevel, 0), 1) * 100);
  }, []);

  const addPublisherListeners = useCallback(
    (publisher: Publisher | null) => {
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
        getAllMediaDevices();
      });
    },
    [calculateAudioLevel, getAllMediaDevices, handleAccessDenied, setAccessStatus]
  );

  const initLocalPublisher = useCallback(async () => {
    const tryingToPublishWithoutSources = !isCameraControlAllowed && !isMicrophoneControlAllowed;

    if (tryingToPublishWithoutSources) {
      throw new Error('Cannot initialize publisher without audio or video sources enabled.');
    }

    if (publisherRef.current) {
      return;
    }

    // Set videoFilter based on user's selected background
    let videoFilter: VideoFilter | undefined;
    if (initialBackgroundRef.current && hasMediaProcessorSupport()) {
      videoFilter = initialBackgroundRef.current;
    }

    await deviceStoreRef.current.init();
    const videoSource = deviceStoreRef.current.getConnectedDeviceId('videoinput');
    const audioSource = deviceStoreRef.current.getConnectedDeviceId('audioinput');

    const publisherOptions: PublisherProperties = {
      insertDefaultUI: false,
      videoFilter,
      resolution: defaultResolution,
      audioSource,
      videoSource,
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
  }, [
    addPublisherListeners,
    defaultResolution,
    isCameraControlAllowed,
    isMicrophoneControlAllowed,
  ]);

  /**
   * Destroys the preview publisher
   * @returns {void}
   */
  const destroyPublisher = useCallback(() => {
    if (publisherRef.current) {
      publisherRef.current.destroy();
      publisherRef.current = null;
    } else {
      console.warn('pub not destroyed');
    }
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
    setIsVideoEnabled(!isVideoEnabled);
    if (setUser) {
      setUser((prevUser: UserType) => ({
        ...prevUser,
        defaultSettings: {
          ...prevUser.defaultSettings,
          publishVideo: !isVideoEnabled,
        },
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
    if (setUser) {
      setUser((prevUser: UserType) => ({
        ...prevUser,
        defaultSettings: {
          ...prevUser.defaultSettings,
          publishAudio: !isAudioEnabled,
        },
      }));
    }
  };

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
    localAudioSource,
    localVideoSource,
    accessStatus,
    speechLevel,
  };
};

export default usePreviewPublisher;
