import { useState, useRef, useEffect, useCallback, useReducer } from 'react';
import OT, {
  Publisher,
  Event,
  Stream,
  initPublisher,
  ExceptionEvent,
  PublisherProperties,
} from '@vonage/client-sdk-video';
import { useTranslation } from 'react-i18next';
import { getStorageItem, STORAGE_KEYS } from '@utils/storage';
import usePublisherQuality, { NetworkQuality } from '../usePublisherQuality/usePublisherQuality';
import useSyncPublisherDevices from './hooks/useSyncPublisherDevices/useSyncPublisherDevices';
import usePublisherOptions from '../usePublisherOptions';
import useApplyAdvancedSettings from '../useApplyAdvancedSettings';
import useSessionContext from '../../../hooks/useSessionContext';
import applyBackgroundFilter from '../../../utils/backgroundFilter/applyBackgroundFilter/applyBackgroundFilter';
import attempt from '@common/execution/attempt';
import useDeviceDenialTracker from '../../../hooks/useDeviceDenialTracker';
import queryDevicePermissionState from '../../../utils/publisher/queryDevicePermissionState';
import persistDeviceIntent from '../../../utils/publisher/persistDeviceIntent';
import waitingRoomDenial$ from '../waitingRoomDenial';
import type { DeniedDevices, DeviceKind } from '../../../utils/publisher/deviceAccess';
import { DEVICE_KINDS, NO_DENIED_DEVICES } from '../../../utils/publisher/deviceAccess';
import idempotentCallbackWithRetry from '@common/execution/idempotentCallbackWithRetry';
import frontendLogger from '../../../logger';

type PublisherStreamCreatedEvent = Event<'streamCreated', Publisher> & {
  stream: Stream;
};

type PublisherVideoElementCreatedEvent = Event<'videoElementCreated', Publisher> & {
  element: HTMLVideoElement | HTMLObjectElement;
};

export type PublishingErrorType = {
  header: string;
  caption: string;
} | null;

export type AccessDeniedEvent = Event<'accessDenied', Publisher> & {
  message?: string;
  // The patched SDK reports which capture device(s) the denial covers — the requested set at
  // init (a combined getUserMedia can't tell which subset was blocked), or the exact device on a
  // mid-call revocation. Absent when running against an unpatched SDK build.
  deniedSources?: DeviceKind[];
};

export type PublisherContextType = {
  initializeLocalPublisher: (options: PublisherProperties) => void;
  isAudioEnabled: boolean;
  isForceMuted: boolean;
  isPublishing: boolean;
  publishingError: PublishingErrorType;
  deniedDevices: DeniedDevices;
  reacquireDevice: (device: DeviceKind) => void;
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

  // Seed from the devices the user denied in the waiting room (handed off via waitingRoomDenial$ on
  // join) so the in-call publisher's FIRST getUserMedia already excludes them — otherwise joining
  // would re-request a device the user dismissed in the waiting room and re-prompt them immediately.
  // Captured once; the mount effect below refines it against the live permission.
  const carriedWaitingRoomDenialRef = useRef<DeniedDevices | undefined>(undefined);
  carriedWaitingRoomDenialRef.current ??= waitingRoomDenial$.getState();

  const [stream, setStream] = useState<Stream | null>(initialValue?.stream ?? null);

  const [publishingError, setPublishingError] = useState<PublishingErrorType>(
    initialValue?.publishingError ?? null
  );

  const isPublishingToSessionRef = useRef<boolean>(false);
  const isInitializingPublisherRef = useRef<boolean>(false);
  const reconnectingRef = useRef<boolean>(false);
  const consecutivePublishingFailureCountRef = useRef<number>(0);

  // Denying a camera/microphone permission mid-call must NOT eject the user to the goodbye page
  // (Google Meet keeps you in the call). The shared tracker surfaces the blocked device via
  // `deniedDevices` so the toolbar can badge it, and hands a re-granted device back here to recover
  // in place. `publishingError` is reserved for genuine publish/network failures, which still
  // redirect.
  const {
    deniedDevices,
    markDeviceDenied,
    clearDeviceDenied,
    applyAccessDeniedEvent,
    reacquireDevice,
  } = useDeviceDenialTracker({
    initialDenied: carriedWaitingRoomDenialRef.current,
    // A device re-granted after a denial comes back ON (unmuted) — the user just re-allowed it.
    // Persisting 'true' keeps it on across the publisher rebuild and a fresh join/reload. Then tear
    // the publisher down so useMeetingRoom re-initializes with the now-unblocked request: the SDK
    // acquires tracks at init, so a publishAudio:false publisher has no mic track to enable, and
    // recreating cleanly avoids useSyncPublisherDevices calling setAudioSource on a track-less
    // publisher (which fails and would otherwise trip the goodbye redirect).
    onRecover: (device) => {
      if (device === 'microphone') {
        setIsAudioEnabled(true);
      } else {
        setIsVideoEnabled(true);
      }
      persistDeviceIntent({ device, enabled: true });

      if (publisherRef.current) {
        attempt(() => {
          publisherRef.current?.destroy();
        });
        publisherRef.current = null;
        isPublishingToSessionRef.current = false;
        isInitializingPublisherRef.current = false;
        setIsPublishing(false);
        setStream(null);
      }
    },
  });

  // Request only the devices that aren't blocked. The SDK does a single getUserMedia for both
  // tracks, so requesting a blocked device fails the whole call and would leave a granted camera
  // dark when only the mic is denied. Requesting just the granted device(s) keeps that camera live.
  const publisherOptions = usePublisherOptions({ isAudioEnabled, isVideoEnabled, deniedDevices });

  const {
    publish: sessionPublish,
    unpublish: sessionUnpublish,
    connected,
    reconnecting,
  } = useSessionContext();

  // Sync publisher with selected devices from store (handles device changes and disconnections)
  useSyncPublisherDevices(publisherRef, { setIsAudioEnabled, setIsVideoEnabled });
  useApplyAdvancedSettings(isPublishing ? publisherRef.current : null);

  reconnectingRef.current = reconnecting === true;

  // Renders are what surface the ref-held publisher through the context, and accessAllowed is the
  // first moment consumers (e.g. useMeetingRoom's publish gate) may act on it — so bump a render
  // explicitly instead of relying on a later SDK event (videoElementCreated/streamCreated) to
  // happen to re-render first.
  const [, renderOnDeviceAccessAllowed] = useReducer((renderCount: number) => renderCount + 1, 0);

  const handleAccessAllowed = useCallback(() => {
    isInitializingPublisherRef.current = false;
    // Deliberately no denial-state change here. When just one device was blocked we re-acquire the
    // other (e.g. camera-only after a mic denial), and that success must not erase the still-blocked
    // device's badge — its re-grant watcher clears it individually.
    renderOnDeviceAccessAllowed();
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

  // On join, refine the waiting-room denial we seeded into the tracker: check each carried device's
  // live permission so a device the user allowed between the waiting room and joining is requested
  // normally (clear the seed), while one still denied keeps its badge and gets a re-grant watcher so
  // it can recover in place. Runs once — the callbacks are stable.
  useEffect(() => {
    // Consume the one-shot hand-off immediately so a denial belongs to exactly the join that wrote
    // it. Without this it would leak into a later room reached WITHOUT the waiting room (a
    // bypass-waiting-room deep link), badging a device that was never denied there — and the
    // refinement below only un-carries a 'granted' device, so a dismissed ('prompt') one would stick.
    waitingRoomDenial$.setState(NO_DENIED_DEVICES);
    const carried = carriedWaitingRoomDenialRef.current;
    if (!carried) {
      return;
    }
    DEVICE_KINDS.forEach((device) => {
      if (!carried[device]) {
        return;
      }
      void queryDevicePermissionState(device).then((state) => {
        if (state === 'granted') {
          clearDeviceDenied(device);
        } else {
          markDeviceDenied(device);
        }
      });
    });
  }, [markDeviceDenied, clearDeviceDenied]);

  const handleAccessDenied = useCallback(
    (event: AccessDeniedEvent) => {
      isInitializingPublisherRef.current = false;

      if (publisherRef.current) {
        publisherRef.current.destroy();
      }
      publisherRef.current = null;

      // The SDK reports the requested device(s), which over-reports when only one was actually
      // blocked (a combined getUserMedia fails wholesale). The tracker resolves the real state
      // authoritatively: it badges/watches the genuinely blocked device(s) and clears any that are
      // actually granted, so a still-granted camera keeps its badge off and gets re-acquired
      // (video-only) while the mic stays blocked.
      void applyAccessDeniedEvent(event);
    },
    [applyAccessDeniedEvent]
  );

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
    persistDeviceIntent({ device: 'microphone', enabled: false });

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
    // Same as toggleAudio: a blocked camera means there is no video track to (un)mute.
    if (!publisherRef.current || deniedDevices.camera) {
      return;
    }
    publisherRef.current.publishVideo(!isVideoEnabled);
    setIsVideoEnabled(!isVideoEnabled);
    persistDeviceIntent({ device: 'camera', enabled: !isVideoEnabled });
  };

  /**
   * Turns the microphone on and off
   * A wrapper for Publisher.publishAudio()
   * More details here: https://vonage.github.io/conversation-docs/video-js-reference/latest/Publisher.html#publishAudio
   * @returns {void}
   */
  const toggleAudio = () => {
    // While the mic is blocked the publisher has no audio track to (un)mute; flipping the flag would
    // falsely show it unmuted and corrupt the persisted audio intent. Ignore until it's re-granted.
    if (!publisherRef.current || deniedDevices.microphone) {
      return;
    }

    const nextAudioEnabled = !isAudioEnabled;

    publisherRef.current.publishAudio(nextAudioEnabled);
    setIsAudioEnabled(nextAudioEnabled);
    persistDeviceIntent({ device: 'microphone', enabled: nextAudioEnabled });
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
    deniedDevices,
    reacquireDevice,
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
