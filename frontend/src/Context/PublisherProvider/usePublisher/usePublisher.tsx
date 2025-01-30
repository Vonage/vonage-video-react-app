import { useState, useRef, useEffect } from 'react';
import OT, {
  Publisher,
  Event,
  Stream,
  initPublisher,
  ExceptionEvent,
} from '@vonage/client-sdk-video';
import usePublisherQuality, { NetworkQuality } from '../usePublisherQuality/usePublisherQuality';
import usePublisherOptions from '../usePublisherOptions';
import useSessionContext from '../../../hooks/useSessionContext';
import { PUBLISHING_BLOCKED_CAPTION } from '../../../utils/constants';

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

export type AccessDeniedEvent = Event<'accessDenied', Publisher> & {
  message?: string;
};

/**
 * @typedef PublishingErrorType - Represents an error message displaying a header and a caption.
 * @property {string} header - The main title of the error message.
 * @property {string} caption - Additional context for the error.
 */
export type PublishingErrorType = {
  header: string;
  caption: string;
};
const publishingBlocked: PublishingErrorType = {
  header: 'Difficulties joining room',
  caption: PUBLISHING_BLOCKED_CAPTION,
};
const createAccessDeniedError = (device: string): PublishingErrorType => ({
  header: `${device} access is denied`,
  caption: `It seems your browser is blocked from accessing your ${device.toLowerCase()}. Reset the permission state through your browser's UI.`,
});

/**
 * Represents an optional error, which is null if there is no error.
 */
export type PublishingError = null | PublishingErrorType;

export type PublisherContextType = {
  initializeLocalPublisher: () => void;
  isAudioEnabled: boolean;
  isForceMuted: boolean;
  isPublishing: boolean;
  publishingError: PublishingError;
  isVideoEnabled: boolean;
  publish: () => Promise<void>;
  publisher: Publisher | null;
  publisherVideoElement: HTMLVideoElement | HTMLObjectElement | undefined;
  quality: NetworkQuality;
  stream: Stream | null | undefined;
  toggleAudio: () => void;
  toggleVideo: () => void;
  unpublish: () => void;
};

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
 * @property {() => void} unpublish - Method to unpublish from session and destroy publisher (for ending a call).
 * @returns {PublisherContextType} the publisher context
 */
const usePublisher = (): PublisherContextType => {
  const [publisherVideoElement, setPublisherVideoElement] = useState<
    HTMLVideoElement | HTMLObjectElement
  >();
  const publisherRef = useRef<Publisher | null>(null);
  const quality = usePublisherQuality(publisherRef.current);
  const [isPublishing, setIsPublishing] = useState(false);
  const publisherOptions = usePublisherOptions();
  const [isForceMuted, setIsForceMuted] = useState<boolean>(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(!!publisherOptions.publishVideo);
  const [isAudioEnabled, setIsAudioEnabled] = useState(!!publisherOptions.publishAudio);
  const [stream, setStream] = useState<Stream | null>();
  const [isPublishingToSession, setIsPublishingToSession] = useState(false);
  const [publishingError, setPublishingError] = useState<PublishingError>(null);
  const mSession = useSessionContext();
  const [deviceAccess, setDeviceAccess] = useState<DeviceAccessStatus>({
    microphone: undefined,
    camera: undefined,
  });
  let publishAttempt: number = 0;

  // If we do not have audio input or video input access, we cannot publish.
  useEffect(() => {
    if (deviceAccess?.microphone === false || deviceAccess.camera === false) {
      const device = deviceAccess.camera ? 'Microphone' : 'Camera';
      const accessDeniedError = createAccessDeniedError(device);
      setPublishingError(accessDeniedError);
    }
  }, [deviceAccess]);

  const handleAccessAllowed = () => {
    setDeviceAccess({
      microphone: true,
      camera: true,
    });
  };

  const handleDestroyed = () => {
    publisherRef.current = null;
  };

  const handleStreamCreated = (e: PublisherStreamCreatedEvent) => {
    setIsPublishing(true);
    setStream(e.stream);
  };

  const handleStreamDestroyed = () => {
    setStream(null);
    setIsPublishing(false);
    if (publisherRef?.current) {
      publisherRef.current.destroy();
    }
    publisherRef.current = null;
  };

  const handleAccessDenied = (event: AccessDeniedEvent) => {
    // We check the first word of the message to see if the microphone or camera was denied access.
    const deviceDeniedAccess =
      event.message?.match(/^(\w*)/)?.[0] === 'microphone' ? 'microphone' : 'camera';
    setDeviceAccess((prev) => ({
      ...prev,
      [deviceDeniedAccess]: false,
    }));

    if (publisherRef.current) {
      publisherRef.current.destroy();
    }
    publisherRef.current = null;
  };

  /**
   * Method to unpublish from session and destroy publisher
   */
  const unpublish = () => {
    if (publisherRef?.current) {
      mSession.session!.unpublish(publisherRef.current);
      setIsPublishingToSession(false);
      publishAttempt = 0;
    }
  };

  const handleVideoElementCreated = (event: PublisherVideoElementCreatedEvent) => {
    setPublisherVideoElement(event.element);
    setIsPublishing(true);
  };

  /**
   * Method to handle the mute force of a participant
   */
  const handleMuteForced = () => {
    if (publisherRef?.current) {
      setIsForceMuted(true);
      setIsAudioEnabled(false);
    }
  };

  const addPublisherListeners = (publisher: Publisher) => {
    publisher.on('destroyed', handleDestroyed);
    publisher.on('streamCreated', handleStreamCreated);
    publisher.on('streamDestroyed', handleStreamDestroyed);
    publisher.on('accessDenied', handleAccessDenied);
    publisher.on('videoElementCreated', handleVideoElementCreated);
    publisher.on('muteForced', handleMuteForced);
    publisher.on('accessAllowed', handleAccessAllowed);
  };

  /**
   * Method to create local camera publisher.
   */
  const initializeLocalPublisher = () => {
    try {
      const publisher = initPublisher(undefined, publisherOptions);
      // Add listeners synchronously as some events could be fired before callback is invoked
      addPublisherListeners(publisher);
      publisherRef.current = publisher;
    } catch (error) {
      if (error instanceof Error) {
        console.warn(error.stack);
      }
    }
  };

  /**
   * Helper function to handle retrying. We allow two attempts when publishing to the session and encountering an
   * error before stopping.
   * @returns {boolean} Returns `true` if we've already retried twice, else `false`
   */
  const shouldNotRetryPublish = (): boolean => {
    publishAttempt += 1;

    if (publishAttempt === 3) {
      setPublishingError(publishingBlocked);
      setIsPublishingToSession(false);
      return true;
    }
    return false;
  };

  /**
   * Method to publish to session.
   * @returns {Promise<void>}
   */
  const publish = async (): Promise<void> => {
    try {
      if (!mSession.session) {
        throw new Error('You are not connected to session');
      }
      if (!publisherRef.current) {
        throw new Error('Publisher is not initialized');
      }
      if (isPublishingToSession) {
        return;
      }

      if (shouldNotRetryPublish()) {
        return;
      }

      mSession.session.publish(publisherRef.current, (error) => {
        if (error) {
          throw new Error(`${error.name}: ${error.message}`);
        }
      });
      setIsPublishingToSession(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.warn(err.stack);
        setIsPublishingToSession(false);
        publish();
      }
    }
  };

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
    setIsForceMuted(false);
  };

  useEffect(() => {
    const exceptionHandler = (exceptionEvent: ExceptionEvent) => {
      if (exceptionEvent.code === 1500) {
        publish();
      }
    };
    // If a user is `Unable to Publish` to a session and an error is thrown, we attempt to re-publish.
    // This error would not be captured in the Session.publish callback, we have to listen for it separately.
    OT.on('exception', exceptionHandler);

    return () => {
      OT.off('exception', exceptionHandler);
    };
  });

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
    unpublish,
  };
};
export default usePublisher;
