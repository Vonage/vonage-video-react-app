import { useState, useRef, useEffect, useCallback } from 'react';
import OT, {
  Publisher,
  Event,
  Stream,
  initPublisher,
  ExceptionEvent,
  PublisherProperties,
} from '@vonage/client-sdk-video';
import { useTranslation } from 'react-i18next';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@utils/storage';
import usePublisherQuality, { NetworkQuality } from '../usePublisherQuality/usePublisherQuality';
import useSyncPublisherDevices from './hooks/useSyncPublisherDevices/useSyncPublisherDevices';
import usePublisherOptions from '../usePublisherOptions';
import useApplyAdvancedSettings from '../useApplyAdvancedSettings';
import useSessionContext from '../../../hooks/useSessionContext';
import applyBackgroundFilter from '../../../utils/backgroundFilter/applyBackgroundFilter/applyBackgroundFilter';
import idempotentCallbackWithRetry from '@common/execution/idempotentCallbackWithRetry';
import frontendLogger from '../../../logger';

type PublisherStreamCreatedEvent = Event<'streamCreated', Publisher> & {
  stream: Stream;
};

type PublisherVideoElementCreatedEvent = Event<'videoElementCreated', Publisher> & {
  element: HTMLVideoElement | HTMLObjectElement;
};

type DeviceAccessStatus = {
  microphone: boolean | undefined;
  camera: boolean | undefined;
};

export type PublishingErrorType = {
  header: string;
  caption: string;
} | null;

export type AccessDeniedEvent = Event<'accessDenied', Publisher> & {
  message?: string;
};

export type PublisherContextType = {
  initializeLocalPublisher: (options: PublisherProperties) => void;
  isAudioEnabled: boolean;
  isForceMuted: boolean;
  isPublishing: boolean;
  publishingError: PublishingErrorType;
  isVideoEnabled: boolean;
  publish: () => Promise<void>;
  publisher: Publisher | null;
  publisherVideoElement: HTMLVideoElement | HTMLObjectElement | null;
  quality: NetworkQuality;
  stream: Stream | null | undefined;
  toggleAudio: () => void;
  toggleVideo: () => void;
  changeBackground: (backgroundSelected: string) => void;
  unpublish: () => void;
  publisherOptions: PublisherProperties;
};

export type PublisherContextInitialValue = Partial<
  Pick<
    PublisherContextType,
    | 'initializeLocalPublisher'
    | 'isAudioEnabled'
    | 'isForceMuted'
    | 'isPublishing'
    | 'publishingError'
    | 'isVideoEnabled'
    | 'publisher'
    | 'publisherVideoElement'
    | 'quality'
    | 'stream'
  >
>;

/**
 * Hook wrapper for creation, interaction with, and state for local video publisher.
 * Access from app via PublisherProvider, not directly.
 * @property {() => void} initializeLocalPublisher - Method to initialize publisher
 * @property {boolean} isAudioEnabled - React state boolean showing if audio is enabled
 * @property {boolean} isPublishing - React state boolean showing if we are publishing
 * @property {boolean} publishingError - React state showing any errors thrown while attempting to publish.
 * @property {boolean} isVideoEnabled - React state boolean showing if camera is on
 * @property {boolean} isForceMuted - React state boolean showing if the end user was force muted
 * @property {() => Promise<void>} publish - Method to publish to session
 * @property {Publisher | null} publisher - Publisher object
 * @property {HTMLVideoElement | HTMLObjectElement} publisherVideoElement - video element for publisher
 * @property {NetworkQuality} quality - React state for current network quality
 * @property {Stream | null | undefined} stream - OT Stream object for publisher
 * @property {() => void} toggleAudio - Method to toggle microphone on/off. State updated internally, can be read via isAudioEnabled.
 * @property {() => void} toggleVideo - Method to toggle camera on/off. State updated internally, can be read via isVideoEnabled.
 * @property {(backgroundSelected: string) => void} changeBackground - Method to change background replacement or blur effect.
 * @property {() => void} unpublish - Method to unpublish from session and destroy publisher (for ending a call).
 * @returns {PublisherContextType} the publisher context
 */
const usePublisher = (initialValue: PublisherContextInitialValue = {}): PublisherContextType => {
  const { t } = useTranslation();
  const [publisherVideoElement, setPublisherVideoElement] = useState<
    HTMLVideoElement | HTMLObjectElement | null
  >(initialValue?.publisherVideoElement ?? null);

  const publisherRef = useRef<Publisher | null>(initialValue.publisher ?? null);
  const quality = usePublisherQuality(publisherRef.current);

  const [isPublishing, setIsPublishing] = useState(initialValue?.isPublishing ?? false);

  const [isForceMuted, setIsForceMuted] = useState<boolean>(initialValue?.isForceMuted ?? false);

  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(
    initialValue?.isVideoEnabled ?? getStorageItem(STORAGE_KEYS.VIDEO_SOURCE_ENABLED) !== 'false'
  );

  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(
    initialValue?.isAudioEnabled ?? getStorageItem(STORAGE_KEYS.AUDIO_SOURCE_ENABLED) !== 'false'
  );

  const publisherOptions = usePublisherOptions({ isAudioEnabled, isVideoEnabled });

  const [stream, setStream] = useState<Stream | null>(initialValue?.stream ?? null);

  const [publishingError, setPublishingError] = useState<PublishingErrorType>(
    initialValue?.publishingError ?? null
  );

  const isPublishingToSessionRef = useRef<boolean>(false);
  const isInitializingPublisherRef = useRef<boolean>(false);
  const reconnectingRef = useRef<boolean>(false);
  const consecutivePublishingFailureCountRef = useRef<number>(0);

  const {
    publish: sessionPublish,
    unpublish: sessionUnpublish,
    connected,
    reconnecting,
  } = useSessionContext();
  const [deviceAccess, setDeviceAccess] = useState<DeviceAccessStatus>({
    microphone: undefined,
    camera: undefined,
  });

  // Sync publisher with selected devices from store (handles device changes and disconnections)
  useSyncPublisherDevices(publisherRef, { setIsAudioEnabled, setIsVideoEnabled });
  useApplyAdvancedSettings(isPublishing ? publisherRef.current : null);

  // If we do not have audio input or video input access, we cannot publish.
  useEffect(() => {
    if (deviceAccess?.microphone === false || deviceAccess?.camera === false) {
      const device = deviceAccess.camera ? 'Microphone' : 'Camera';
      const accessDeniedError = {
        header: t('publishingErrors.accessDenied.title', { device }),
        caption: t('publishingErrors.accessDenied.message', { device: device.toLowerCase() }),
      };
      setPublishingError(accessDeniedError);
    }
  }, [deviceAccess, t]);

  reconnectingRef.current = reconnecting === true;

  const handleAccessAllowed = useCallback(() => {
    isInitializingPublisherRef.current = false;
    setDeviceAccess({
      microphone: true,
      camera: true,
    });
  }, []);

  const handleDestroyed = useCallback(() => {
    frontendLogger.log('usePublisher: handle destroyed');

    publisherRef.current = null;
  }, []);

  /**
   * Change background replacement or blur effect
   * @param {string} backgroundSelected - The selected background option
   * @returns {void}
   */
  const changeBackground = useCallback((backgroundSelected: string) => {
    applyBackgroundFilter({
      publisher: publisherRef.current,
      backgroundSelected,
      setUser: undefined,
      setBackgroundFilter: undefined,
      storeItem: true,
    }).catch(() => {
      console.error('Failed to apply background filter.');
    });
  }, []);

  const handleStreamCreated = useCallback((e: PublisherStreamCreatedEvent) => {
    frontendLogger.log('usePublisher: handle stream created', {
      streamId: e.stream?.streamId,
      streamHasAudio: e.stream?.hasAudio,
      streamHasVideo: e.stream?.hasVideo,
    });
    setIsPublishing(true);
    setStream(e.stream);
    // Reset the flag now that the stream is actually established
    isPublishingToSessionRef.current = false;

    // Successful publish resets transient failure tracking
    consecutivePublishingFailureCountRef.current = 0;
    setPublishingError(null);
  }, []);

  const handleStreamDestroyed = useCallback(() => {
    frontendLogger.log('usePublisher: handle stream destroyed', {
      reconnecting: reconnectingRef.current,
      hasPublisher: !!publisherRef.current,
      hasStream: !!publisherRef.current?.stream,
    });
    setStream(null);
    setIsPublishing(false);

    const shouldPreservePublisher =
      reconnectingRef.current ||
      isPublishingToSessionRef.current ||
      isInitializingPublisherRef.current;

    if (shouldPreservePublisher) {
      frontendLogger.log('usePublisher: handle stream destroyed - preserving publisher', {
        reconnecting: reconnectingRef.current,
        isPublishingToSession: isPublishingToSessionRef.current,
        isInitializingPublisher: isInitializingPublisherRef.current,
      });
      isPublishingToSessionRef.current = false;
      return;
    }

    if (publisherRef?.current) {
      publisherRef.current.destroy();
      publisherRef.current = null;
    }
  }, []);

  const handleAccessDenied = useCallback((event: AccessDeniedEvent) => {
    const deviceDeniedAccess = event.message?.startsWith('Microphone') ? 'microphone' : 'camera';
    isInitializingPublisherRef.current = false;
    // We check the first word of the message to see if the microphone or camera was denied access.
    setDeviceAccess((prev) => ({
      ...prev,
      [deviceDeniedAccess]: false,
    }));

    if (publisherRef.current) {
      publisherRef.current.destroy();
    }
    publisherRef.current = null;
  }, []);

  /**
   * Method to unpublish from session and destroy publisher
   */
  const unpublish = () => {
    if (publisherRef?.current) {
      sessionUnpublish(publisherRef.current);
      isPublishingToSessionRef.current = false;
    }
  };

  const handleVideoElementCreated = useCallback((event: PublisherVideoElementCreatedEvent) => {
    setPublisherVideoElement(event.element);
  }, []);

  /**
   * Method to handle the mute force of a participant
   */
  const handleMuteForced = useCallback(() => {
    if (!publisherRef?.current) {
      return;
    }

    setIsForceMuted(true);
    setIsAudioEnabled(false);

    // Force mute must survive reconnection/publisher re-creation; persist mic-off.
    setStorageItem(STORAGE_KEYS.AUDIO_SOURCE_ENABLED, 'false');

    // Extra safety: enforce mute on the SDK publisher immediately.
    publisherRef.current.publishAudio(false);
  }, []);

  const addPublisherListeners = useCallback(
    (publisher: Publisher) => {
      publisher.on('destroyed', handleDestroyed);
      publisher.on('streamCreated', handleStreamCreated);
      publisher.on('streamDestroyed', handleStreamDestroyed);
      publisher.on('accessDenied', handleAccessDenied);
      publisher.on('videoElementCreated', handleVideoElementCreated);
      publisher.on('muteForced', handleMuteForced);
      publisher.on('accessAllowed', handleAccessAllowed);
    },
    [
      handleAccessAllowed,
      handleAccessDenied,
      handleDestroyed,
      handleMuteForced,
      handleStreamCreated,
      handleStreamDestroyed,
      handleVideoElementCreated,
    ]
  );

  /**
   * Method to create local camera publisher.
   * @param {PublisherProperties} options - the publisher options to initialize the local publisher with
   */
  const initializeLocalPublisher = useCallback(
    (options: PublisherProperties) => {
      try {
        // Don't re-initialize if we're currently publishing
        if (isPublishingToSessionRef.current) {
          return;
        }
        // Don't re-initialize if we're already initializing
        if (isInitializingPublisherRef.current) {
          return;
        }
        // Don't re-initialize if we already have a publisher
        if (publisherRef.current) {
          return;
        }
        isInitializingPublisherRef.current = true;

        const publisher = initPublisher(undefined, options);
        // Add listeners synchronously as some events could be fired before callback is invoked
        addPublisherListeners(publisher);
        publisherRef.current = publisher;

        frontendLogger.log('usePublisher: initialize local publisher');

        // NOTE: isInitializingPublisherRef.current will be reset in handleAccessAllowed or handleAccessDenied
        // NOT here, because getUserMedia is async and we need to keep the lock until media access is granted/denied
      } catch (error) {
        frontendLogger.reportError(error, { source: 'usePublisher: initialize local publisher' });
        isInitializingPublisherRef.current = false;
        if (error instanceof Error) {
          console.error(error.stack);
        }
      }
    },
    [addPublisherListeners]
  );

  /**
   * Helper function to handle retrying. We allow two attempts when publishing to the session and encountering an
   * error before stopping.
   */
  const handlePublishingError = useCallback((): void => {
    const publishingBlocked: PublishingErrorType = {
      header: t('publishingErrors.blocked.title'),
      caption: t('publishingErrors.blocked.message'),
    };
    setPublishingError(publishingBlocked);
  }, [t]);

  /**
   * Method to publish to session.
   * @returns {Promise<void>}
   */
  const publish = useCallback(async (): Promise<void> => {
    try {
      if (isPublishingToSessionRef.current) {
        return; // Avoid multiple simultaneous publish attempts
      }
      if (reconnecting) {
        return;
      }
      if (!connected) {
        throw new Error('You are not connected to session');
      }
      if (!publisherRef.current) {
        throw new Error('Publisher is not initialized');
      }
      if (publisherRef.current?.stream) {
        return;
      }

      isPublishingToSessionRef.current = true;

      await idempotentCallbackWithRetry(() => sessionPublish(publisherRef.current!), {
        retries: 2,
        delayMs: 500,
      });
      frontendLogger.log('usePublisher: publish success');
      // Don't reset isPublishingToSessionRef here - wait for streamCreated event
    } catch (err: unknown) {
      frontendLogger.reportError(err, { source: 'usePublisher: publish' });
      // Reset the flag on error since we won't get streamCreated
      isPublishingToSessionRef.current = false;

      // Don't surface errors during reconnection - they're transient
      if (!reconnectingRef.current) {
        handlePublishingError();
      }

      console.error(err);
    }
  }, [connected, reconnecting, sessionPublish, handlePublishingError]);

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
    setStorageItem(STORAGE_KEYS.VIDEO_SOURCE_ENABLED, (!isVideoEnabled).toString());
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

    const nextAudioEnabled = !isAudioEnabled;

    publisherRef.current.publishAudio(nextAudioEnabled);
    setIsAudioEnabled(nextAudioEnabled);
    setStorageItem(STORAGE_KEYS.AUDIO_SOURCE_ENABLED, nextAudioEnabled.toString());
    setIsForceMuted(false);
  };

  useEffect(() => {
    const exceptionHandler = (exceptionEvent: ExceptionEvent) => {
      if (exceptionEvent.code === 1500) {
        frontendLogger.log('usePublisher: exception 1500', { code: exceptionEvent.code });
        consecutivePublishingFailureCountRef.current += 1;

        const isBrowserOnline = (() => {
          if (typeof navigator === 'undefined') return true;
          return navigator.onLine;
        })();

        // During network changes, code 1500 is often transient.
        // Try to recover by recreating the publisher; only surface a blocking error after repeated failures.
        const shouldTreatAsTransient = reconnectingRef.current || !connected || !isBrowserOnline;

        const publisherToCleanup = publisherRef.current;
        publisherRef.current = null;

        try {
          publisherToCleanup?.destroy();
        } catch {
          console.error('[PUBLISHER] exception 1500 - Warning: Failed to destroy publisher');
        }

        isPublishingToSessionRef.current = false;
        isInitializingPublisherRef.current = false;
        setIsPublishing(false);
        setStream(null);

        const shouldSurfaceBlockingError =
          shouldTreatAsTransient === false && consecutivePublishingFailureCountRef.current >= 3;

        if (shouldSurfaceBlockingError) {
          handlePublishingError();
          return;
        }

        // Let the normal flow recreate/publish when possible
        // (autoPublish effect + reconnection completion effect)
      }
    };
    // If a user is `Unable to Publish` to a session and an error is thrown, we log it.
    // The retry logic is already handled by idempotentCallbackWithRetry in the publish function.
    OT.on('exception', exceptionHandler);

    return () => {
      OT.off('exception', exceptionHandler);
    };
  }, [connected, handlePublishingError]);

  return {
    initializeLocalPublisher,
    isAudioEnabled,
    isForceMuted,
    isPublishing,
    publishingError,
    isVideoEnabled,
    publish,
    publisher: publisherRef.current,
    publisherVideoElement,
    quality,
    stream,
    toggleAudio,
    toggleVideo,
    changeBackground,
    unpublish,
    publisherOptions,
  };
};
export default usePublisher;
