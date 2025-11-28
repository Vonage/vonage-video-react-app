import { useState, useRef, useCallback } from 'react';
import {
  Publisher,
  Event,
  Stream,
  initPublisher,
  PublisherProperties,
} from '@vonage/client-sdk-video';
import { useTranslation } from 'react-i18next';
import useSuspenseUntilAppConfigReady from '@Context/AppConfig/hooks/useSuspenseUntilAppConfigReady';
import usePublisherQuality, { NetworkQuality } from '../usePublisherQuality/usePublisherQuality';
import usePublisherOptions from '../usePublisherOptions';
import useSessionContext from '../../../hooks/useSessionContext';
import applyBackgroundFilter from '../../../utils/backgroundFilter/applyBackgroundFilter/applyBackgroundFilter';
import idempotentCallbackWithRetry from '@utils/idempotentCallbackWithRetry/idempotentCallbackWithRetry';
import useStableCallback from '@hooks/useStableCallback';

type PublisherStreamCreatedEvent = Event<'streamCreated', Publisher> & { stream: Stream };

type PublisherVideoElementCreatedEvent = Event<'videoElementCreated', Publisher> & {
  element: HTMLVideoElement | HTMLObjectElement;
};

export type PublishingErrorType = { header: string; caption: string } | null;

export type AccessDeniedEvent = Event<'accessDenied', Publisher> & { message?: string };

export type ApplyBackgroundFilterParams = Parameters<typeof applyBackgroundFilter>[0];

export type PublisherContextType = {
  initializeLocalPublisher: (options: Partial<PublisherProperties>) => Publisher;
  isAudioEnabled: boolean;
  isForceMuted: boolean;
  isPublishing: boolean;
  publishingError: PublishingErrorType;
  isVideoEnabled: boolean;
  publish: () => Promise<void>;
  publisher: Publisher | null;
  publisherVideoElement: HTMLVideoElement | HTMLObjectElement | undefined;
  quality: NetworkQuality;
  stream: Stream | null | undefined;
  toggleAudio: () => boolean;
  toggleVideo: () => boolean;
  changeBackground: (args: ApplyBackgroundFilterParams) => Promise<void>;
  unpublish: () => void;
  publisherOptions: PublisherProperties | null;
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
 * @property {(backgroundSelected: string) => void} changeBackground - Method to change background replacement or blur effect.
 * @property {() => void} unpublish - Method to unpublish from session and destroy publisher (for ending a call).
 * @returns {PublisherContextType} the publisher context
 */
const usePublisher = (): PublisherContextType => {
  useSuspenseUntilAppConfigReady();

  const {
    publisherOptions,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio: _toggleAudio,
    toggleVideo: _toggleVideo,
  } = usePublisherOptions();

  const { t } = useTranslation();
  const [publisherVideoElement, setPublisherVideoElement] = useState<
    HTMLVideoElement | HTMLObjectElement
  >();

  const publisherRef = useRef<Publisher | null>(null);
  const quality = usePublisherQuality(publisherRef.current);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isForceMuted, setIsForceMuted] = useState<boolean>(false);

  const [stream, setStream] = useState<Stream | null>();
  const [publishingError, setPublishingError] = useState<PublishingErrorType>(null);
  const { publish: sessionPublish, unpublish: sessionUnpublish, connected } = useSessionContext();

  /**
   * Change background replacement or blur effect
   * @param {string} backgroundSelected - The selected background option
   * @returns {void}
   */
  const changeBackground = useCallback((args: ApplyBackgroundFilterParams) => {
    return applyBackgroundFilter({
      publisher: publisherRef.current,
      setUser: undefined,
      setBackgroundFilter: undefined,
      storeItem: true,
      ...args,
    } as ApplyBackgroundFilterParams).catch(() => {
      console.error('Failed to apply background filter.');
    });
  }, []);

  /**
   * Method to unpublish from session and destroy publisher
   */
  const unpublish = useStableCallback(() => {
    debugger;
    if (publisherRef?.current) {
      const publisher = publisherRef.current;
      publisherRef.current = null;

      sessionUnpublish(publisher);
      setIsPublishing(false);

      publisher.destroy();
    }
  });

  /**
   * Method to create local camera publisher.
   * @param {PublisherProperties} options - the publisher options to initialize the local publisher with
   */
  const initializeLocalPublisher = useStableCallback((options: Partial<PublisherProperties>) => {
    debugger;
    if (publisherRef.current) {
      return publisherRef.current;
    }

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
        _toggleAudio(false);
      }
    };

    const publisher = initPublisher(undefined, options);

    // Add listeners synchronously as some events could be fired before callback is invoked
    publisher.on('destroyed', unpublish);
    publisher.on('streamCreated', handleStreamCreated);
    publisher.on('streamDestroyed', handleStreamDestroyed);
    publisher.on('videoElementCreated', handleVideoElementCreated);
    publisher.on('muteForced', handleMuteForced);

    publisherRef.current = publisher;

    return publisher;
  });

  /**
   * Method to publish to session.
   */
  const publish = async (): Promise<void> => {
    try {
      if (isPublishing) {
        throw new Error('The publisher is already publishing');
      }

      if (!connected) {
        throw new Error('You are not connected to session');
      }

      const publisher = publisherRef.current;

      if (!publisher) {
        throw new Error('Publisher is not initialized');
      }

      setIsPublishing(true);

      await idempotentCallbackWithRetry(() => sessionPublish(publisher), {
        retries: 2,
        delayMs: 200,
      });
    } catch (err: unknown) {
      const publishingBlocked: PublishingErrorType = {
        header: t('publishingErrors.blocked.title'),
        caption: t('publishingErrors.blocked.message'),
      };

      setPublishingError(publishingBlocked);
      setIsPublishing(false);

      throw err;
    }
  };

  /**
   * Turns the camera on and off
   * A wrapper for Publisher.publishVideo()
   * More details here: https://vonage.github.io/conversation-docs/video-js-reference/latest/Publisher.html#publishVideo
   * @returns {void}
   */
  const toggleVideo = (): boolean => {
    // TODO: initialize and publish if necessary

    const newIsVideoEnabled = !isVideoEnabled;

    publisherRef.current!.publishVideo(newIsVideoEnabled);
    _toggleVideo(newIsVideoEnabled);

    return newIsVideoEnabled;
  };

  /**
   * Turns the microphone on and off
   * A wrapper for Publisher.publishAudio()
   * More details here: https://vonage.github.io/conversation-docs/video-js-reference/latest/Publisher.html#publishAudio
   * @returns {void}
   */
  const toggleAudio = (): boolean => {
    // TODO: initialize and publish if necessary

    const newIsAudioEnabled = !isAudioEnabled;

    publisherRef.current!.publishAudio(newIsAudioEnabled);
    _toggleAudio(newIsAudioEnabled);
    setIsForceMuted(false);

    return newIsAudioEnabled;
  };

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
