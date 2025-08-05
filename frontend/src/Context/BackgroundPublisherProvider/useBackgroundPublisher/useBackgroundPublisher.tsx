import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Publisher,
  Event,
  initPublisher,
  VideoFilter,
  hasMediaProcessorSupport,
  PublisherProperties,
} from '@vonage/client-sdk-video';
import setMediaDevices from '../../../utils/mediaDeviceUtils';
import useDevices from '../../../hooks/useDevices';
import usePermissions from '../../../hooks/usePermissions';
import useUserContext from '../../../hooks/useUserContext';
import { DEVICE_ACCESS_STATUS } from '../../../utils/constants';
import { AccessDeniedEvent } from '../../PublisherProvider/usePublisher/usePublisher';
import DeviceStore from '../../../utils/DeviceStore';
import applyBackgroundFilter from '../../../utils/backgroundFilter/applyBackgroundFilter/applyBackgroundFilter';

export type BackgroundPublisherContextType = {
  isPublishing: boolean;
  isVideoEnabled: boolean;
  publisher: Publisher | null;
  publisherVideoElement: HTMLVideoElement | HTMLObjectElement | undefined;
  destroyBackgroundPublisher: () => void;
  toggleVideo: () => void;
  changeBackground: (backgroundSelected: string) => void;
  backgroundFilter: VideoFilter | undefined;
  localVideoSource: string | undefined;
  accessStatus: string | null;
  changeVideoSource: (deviceId: string) => void;
  initBackgroundLocalPublisher: () => Promise<void>;
};

type PublisherVideoElementCreatedEvent = Event<'videoElementCreated', Publisher> & {
  element: HTMLVideoElement | HTMLObjectElement;
};

/**
 * Hook wrapper for creation, interaction with, and state for local video publisher with background effects.
 * Access from app via BackgroundPublisherProvider, not directly.
 * @property {boolean} isPublishing - React state boolean showing if we are publishing
 * @property {boolean} isVideoEnabled - React state boolean showing if camera is on
 * @property {Publisher | null} publisher - Publisher object
 * @property {HTMLVideoElement | HTMLObjectElement} publisherVideoElement - video element for publisher
 * @property {Function} destroyBackgroundPublisher - Method to destroy publisher
 * @property {Function} toggleVideo - Method to toggle camera on/off. State updated internally, can be read via isVideoEnabled.
 * @property {Function} changeBackground - Method to change background effect
 * @property {VideoFilter | undefined} backgroundFilter - Current background filter applied to publisher
 * @property {string | undefined} localVideoSource - Current video source device ID
 * @property {string | null} accessStatus - Current device access status
 * @property {Function} changeVideoSource - Method to change video source device ID
 * @property {Function} initBackgroundLocalPublisher - Method to initialize the background publisher
 * @returns {BackgroundPublisherContextType} Background context
 */
const useBackgroundPublisher = (): BackgroundPublisherContextType => {
  const { user } = useUserContext();
  const { allMediaDevices, getAllMediaDevices } = useDevices();
  const [publisherVideoElement, setPublisherVideoElement] = useState<
    HTMLVideoElement | HTMLObjectElement
  >();
  const { setAccessStatus, accessStatus } = usePermissions();
  const backgroundPublisherRef = useRef<Publisher | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const initialBackgroundRef = useRef<VideoFilter | undefined>(
    user.defaultSettings.backgroundFilter
  );
  const [backgroundFilter, setBackgroundFilter] = useState<VideoFilter | undefined>(
    user.defaultSettings.backgroundFilter
  );
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [localVideoSource, setLocalVideoSource] = useState<string | undefined>(undefined);
  const deviceStoreRef = useRef<DeviceStore>(new DeviceStore());

  /* This sets the default devices in use so that the user knows what devices they are using */
  useEffect(() => {
    setMediaDevices(backgroundPublisherRef, allMediaDevices, () => {}, setLocalVideoSource);
  }, [allMediaDevices]);

  const handleBackgroundDestroyed = () => {
    backgroundPublisherRef.current = null;
  };

  /**
   * Change background replacement or blur effect
   * @param {string} backgroundSelected - The selected background option
   * @returns {void}
   */
  const changeBackground = useCallback(
    (backgroundSelected: string) => {
      applyBackgroundFilter({
        publisher: backgroundPublisherRef.current,
        backgroundSelected,
        setUser: undefined,
        setBackgroundFilter,
        storeItem: false,
      }).catch(() => {
        console.error('Failed to apply background filter.');
      });
    },
    [setBackgroundFilter]
  );

  /**
   * Change video camera in use
   * @returns {void}
      ).catch(() => {
        console.error('Failed to apply background filter.');
      });
    },
    [setBackgroundFilter]
  );
   
  /**
   * Change video camera in use
   * @returns {void}
   */
  const changeVideoSource = useCallback((deviceId: string) => {
    if (!deviceId || !backgroundPublisherRef.current) {
      return;
    }
    backgroundPublisherRef.current.setVideoSource(deviceId);
    setLocalVideoSource(deviceId);
  }, []);

  /**
   * Handle device permissions denial
   * used to inform the user they need to give permissions to devices to access the call
   * after a user grants permissions to the denied device, trigger a reload.
   * @returns {void}
   */
  const handleBackgroundAccessDenied = useCallback(
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

  const addPublisherListeners = useCallback(
    (publisher: Publisher | null) => {
      if (!publisher) {
        return;
      }
      publisher.on('destroyed', handleBackgroundDestroyed);
      publisher.on('accessDenied', handleBackgroundAccessDenied);
      publisher.on('videoElementCreated', handleVideoElementCreated);
      publisher.on('accessAllowed', () => {
        setAccessStatus(DEVICE_ACCESS_STATUS.ACCEPTED);
        getAllMediaDevices();
      });
    },
    [getAllMediaDevices, handleBackgroundAccessDenied, setAccessStatus]
  );

  const initBackgroundLocalPublisher = useCallback(async () => {
    if (backgroundPublisherRef.current) {
      return;
    }

    // Set videoFilter based on user's selected background
    let videoFilter: VideoFilter | undefined;
    if (initialBackgroundRef.current && hasMediaProcessorSupport()) {
      videoFilter = initialBackgroundRef.current;
    }

    await deviceStoreRef.current.init();
    const videoSource = deviceStoreRef.current.getConnectedDeviceId('videoinput');

    const publisherOptions: PublisherProperties = {
      insertDefaultUI: false,
      videoFilter,
      resolution: '1280x720',
      videoSource,
    };

    backgroundPublisherRef.current = initPublisher(undefined, publisherOptions, (err: unknown) => {
      if (err instanceof Error) {
        backgroundPublisherRef.current = null;
        if (err.name === 'OT_USER_MEDIA_ACCESS_DENIED') {
          console.error('initPublisher error: ', err);
        }
      }
    });
    addPublisherListeners(backgroundPublisherRef.current);
  }, [addPublisherListeners]);

  /**
   * Destroys the background publisher
   * @returns {void}
   */
  const destroyBackgroundPublisher = useCallback(() => {
    if (backgroundPublisherRef.current) {
      backgroundPublisherRef.current.destroy();
      backgroundPublisherRef.current = null;
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
    if (!backgroundPublisherRef.current) {
      return;
    }
    backgroundPublisherRef.current.publishVideo(!isVideoEnabled);
    setIsVideoEnabled(!isVideoEnabled);
  };

  return {
    initBackgroundLocalPublisher,
    isPublishing,
    isVideoEnabled,
    destroyBackgroundPublisher,
    publisher: backgroundPublisherRef.current,
    publisherVideoElement,
    toggleVideo,
    changeBackground,
    backgroundFilter,
    changeVideoSource,
    localVideoSource,
    accessStatus,
  };
};
export default useBackgroundPublisher;
