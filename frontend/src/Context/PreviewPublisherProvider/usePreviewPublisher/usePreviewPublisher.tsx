import { useState, useRef, useCallback, useEffect } from 'react';
import { initPublisher } from '@vonage/client-sdk-video';
import hasMediaProcessorSupport from '@utils/hasMediaProcessorSupport/hasMediaProcessorSupport';
import type { Event, Publisher, PublisherProperties, VideoFilter } from '@vonage/client-sdk-video';
import usePermissions from '../../../hooks/usePermissions';
import useUserContext from '../../../hooks/useUserContext';
import { DEVICE_ACCESS_STATUS } from '../../../utils/constants';
import { UserType } from '../../user';
import { AccessDeniedEvent } from '../../PublisherProvider/usePublisher/usePublisher';
import { setStorageItem, getStorageItem, STORAGE_KEYS } from '../../../utils/storage';
import applyBackgroundFilter from '../../../utils/backgroundFilter/applyBackgroundFilter/applyBackgroundFilter';
import handlePublisherAccessDenied from '../../../utils/publisher/handlePublisherAccessDenied';
import type { DeniedDevices, DeviceKind } from '../../../utils/publisher/deviceAccess';
import {
  NO_DENIED_DEVICES,
  DEVICE_REACQUIRE_FALLBACK_MS,
} from '../../../utils/publisher/deviceAccess';
import useStableCallback from '@web/hooks/useStableCallback';
import mediaDevices$ from '@core/stores/mediaDevices';
import useSyncPublisherDevices from '@Context/PublisherProvider/usePublisher/hooks/useSyncPublisherDevices/useSyncPublisherDevices';
import waitUntilPlaying from '@utils/waitUntilPlaying';
import { attempt } from '@common/execution';
import { useMountEffect } from '@web/hooks';
import advancedSettings$ from '@Context/AdvancedSettings';
import useApplyAdvancedSettings from '@Context/PublisherProvider/useApplyAdvancedSettings';
import { env } from '../../../env';

type PublisherVideoElementCreatedEvent = Event<'videoElementCreated', Publisher> & {
  element: HTMLVideoElement | HTMLObjectElement;
};

export type PreviewPublisherContextType = {
  isAudioEnabled: boolean;
  isPublishing: boolean;
  isAcquiring: boolean;
  isVideoEnabled: boolean;
  publisher: Publisher | null;
  publisherVideoElement: HTMLVideoElement | HTMLObjectElement | undefined;
  destroyPublisher: (target?: Publisher | null) => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  changeBackground: (backgroundSelected: string) => Promise<void>;
  backgroundFilter: VideoFilter | undefined;
  accessStatus: string | null;
  deniedDevices: DeniedDevices;
  reacquireDevice: (device: DeviceKind) => void;
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
    | 'deniedDevices'
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
  const [deniedDevices, setDeniedDevices] = useState<DeniedDevices>(
    initialValue?.deniedDevices ?? NO_DENIED_DEVICES
  );
  // Mirror deniedDevices so the delayed reacquire fallback below reads the latest value (not the one
  // captured in its closure) when it checks whether onchange has already recovered the device.
  const deniedDevicesRef = useRef(deniedDevices);
  deniedDevicesRef.current = deniedDevices;
  const publisherRef = useRef<Publisher | null>(null);

  const [isPublishing, setIsPublishing] = useState<boolean>(initialValue?.isPublishing ?? false);
  // True from the moment a publisher's getUserMedia starts until it settles (accessAllowed /
  // accessDenied / init error). The recovery path reads this to SERIALIZE rebuilds: tearing a
  // publisher down while its getUserMedia is still acquiring aborts it (OT_CANCEL) and wedges the SDK
  // ('Destroyed' cannot transition to 'Failed'). Re-granting a second device must therefore wait for
  // the in-flight acquire to finish before destroying and rebuilding.
  const [isAcquiring, setIsAcquiring] = useState<boolean>(false);
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
    // `publisher` is exposed from a ref, so clearing the video element state is what forces a
    // re-render — this lets consumers observe the publisher going away and re-initialize it.
    setPublisherVideoElement(undefined);
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

  const handleAccessDenied = useCallback(
    async (event: AccessDeniedEvent) => {
      // Settle the preview once media access is denied: without a granted camera no
      // `videoElementCreated` will ever fire, so the room would otherwise stay stuck on the
      // loading skeleton behind a blocking alert. Settling lets the waiting room render inline
      // with the affected device badged (Google Meet style).
      setIsVideoLoading(false);
      setIsAcquiring(false);
      await handlePublisherAccessDenied({
        event,
        setAccessStatus,
        onDeniedDevicesChange: setDeniedDevices,
        // A device re-granted after a denial comes back ON (unmuted) — the user just re-allowed it,
        // so recover it live rather than leaving it off. Persist the intent to 'true' rather than
        // only flipping transient state: storage is what the in-place re-init reads, what survives a
        // whole-publisher rebuild when the other device is re-granted next, and what the in-call
        // publisher reads on join — so the device stays on consistently everywhere.
        onDeviceReGrant: (device) => {
          setStorageItem(
            device === 'microphone'
              ? STORAGE_KEYS.AUDIO_SOURCE_ENABLED
              : STORAGE_KEYS.VIDEO_SOURCE_ENABLED,
            'true'
          );
        },
      });
    },
    [setAccessStatus]
  );

  /**
   * Recover a device the user just re-granted via the badge click (the click-to-re-prompt getUserMedia
   * succeeded). Normally re-grant recovery is driven by PermissionStatus.onchange, but that never
   * fires for camera/microphone in Safari, so the granted device would otherwise stay badged. We
   * recover after a short grace period and only if the device is still denied — so on Chrome, where
   * onchange has already recovered it, this is a no-op (no double rebuild). Mirrors the onchange path:
   * bring the device back on (unmuted) and re-init in place via ACCESS_CHANGED.
   * @param {DeviceKind} device - the re-granted device to bring back.
   * @returns {void}
   */
  const reacquireDevice = useCallback(
    (device: DeviceKind) => {
      window.setTimeout(() => {
        if (!deniedDevicesRef.current[device]) {
          return;
        }
        setStorageItem(
          device === 'microphone'
            ? STORAGE_KEYS.AUDIO_SOURCE_ENABLED
            : STORAGE_KEYS.VIDEO_SOURCE_ENABLED,
          'true'
        );
        setDeniedDevices((previous) => ({ ...previous, [device]: false }));
        setAccessStatus(DEVICE_ACCESS_STATUS.ACCESS_CHANGED);
      }, DEVICE_REACQUIRE_FALLBACK_MS);
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
      setIsAcquiring(false);
      setAccessStatus(DEVICE_ACCESS_STATUS.ACCEPTED);
      // Don't blanket-clear here: when only one device was blocked we re-acquire the *other* one
      // (e.g. camera-only after a mic denial), and that success must not erase the still-blocked
      // device's badge. Each blocked device is cleared individually by its re-grant watcher.
    });
  });

  const initLocalPublisher = useStableCallback(() => {
    if (publisherRef.current) {
      return;
    }

    let videoFilter: VideoFilter | undefined;
    if (initialBackgroundRef.current && hasMediaProcessorSupport('both')) {
      videoFilter = initialBackgroundRef.current;
    }

    const { frameRate, codecMode, codecPriority } = advancedSettings$.getState();

    // Publish according to the user's *intent* (persisted on manual toggle), not the current
    // enabled flags. While a device is blocked, useSyncPublisherDevices flips those flags off to
    // reflect the missing device; re-initializing from them on re-grant would wrongly come back
    // muted. Storage still holds the last manual choice, so a device the user never muted returns
    // unmuted, while one they muted stays muted.
    // Publish according to the user's persisted intent. A device re-granted after a denial has had
    // its intent written to 'false' (Google Meet re-acquires it muted), so reading storage here also
    // brings it back off; a device the user never denied keeps whatever intent it had.
    const intendedAudioEnabled = getStorageItem(STORAGE_KEYS.AUDIO_SOURCE_ENABLED) !== 'false';
    const intendedVideoEnabled = getStorageItem(STORAGE_KEYS.VIDEO_SOURCE_ENABLED) !== 'false';
    setIsAudioEnabled(intendedAudioEnabled);
    setIsVideoEnabled(intendedVideoEnabled);

    // Only request devices that aren't blocked. The SDK does a single getUserMedia for both
    // tracks, so requesting a blocked device fails the whole call — which would leave a granted
    // camera dark when only the mic is denied. Requesting just the granted device(s) lets the
    // camera preview come up while the mic stays badged (Google Meet style).
    const publisherOptions: PublisherProperties = {
      insertDefaultUI: false,
      videoFilter,
      resolution: env.PUBLISHER_MAX_RESOLUTION,
      frameRate,
      preferredVideoCodecs: codecMode === 'automatic' ? 'automatic' : codecPriority,
      publishAudio: intendedAudioEnabled && !deniedDevices.microphone,
      publishVideo: intendedVideoEnabled && !deniedDevices.camera,
      // A blocked device must be excluded from the source, not just from publishAudio/publishVideo:
      // those only start the track muted, while the SDK still acquires it via getUserMedia. Passing
      // the blocked device's id would make the single combined getUserMedia fail wholesale, leaving
      // the granted camera dark. `false` tells the SDK to skip acquiring that track entirely.
      audioSource: deniedDevices.microphone ? false : audioSourceId,
      videoSource: deniedDevices.camera ? false : videoSourceId,
    };

    // A getUserMedia is now in flight; block the recovery path from tearing this publisher down until
    // it settles (accessAllowed/accessDenied below, or the init error here).
    setIsAcquiring(true);
    publisherRef.current = initPublisher(undefined, publisherOptions, (err: unknown) => {
      if (err instanceof Error) {
        publisherRef.current = null;
        setIsAcquiring(false);
        if (err.name === 'OT_USER_MEDIA_ACCESS_DENIED') {
          console.error('initPublisher error: ', err);
        }
      }
    });

    addPublisherListeners(publisherRef.current);
  });

  // When exactly one device is blocked, the combined getUserMedia above failed (no publisher) but
  // the other device is still available. Retry with the reduced request so the granted device —
  // typically the camera when the mic is blocked — still comes up. When both are blocked there is
  // nothing to acquire, and when neither is blocked the normal init path already ran.
  const lastPreviewAttemptRef = useRef<string | null>(null);
  useEffect(() => {
    if (publisherRef.current) {
      lastPreviewAttemptRef.current = null;
      return;
    }
    const someDenied = deniedDevices.microphone || deniedDevices.camera;
    const someGranted = !deniedDevices.microphone || !deniedDevices.camera;
    // Don't re-request the identical source set that just failed. On Safari every getUserMedia
    // re-prompts and permissions.query is unreliable, so without this the reduced-request retry would
    // loop forever. A genuinely different request (a device un-blocked, a source changed) has a new
    // signature and is still allowed.
    const attemptSignature = `${deniedDevices.microphone ? 'false' : audioSourceId}|${
      deniedDevices.camera ? 'false' : videoSourceId
    }`;
    if (someDenied && someGranted && lastPreviewAttemptRef.current !== attemptSignature) {
      lastPreviewAttemptRef.current = attemptSignature;
      initLocalPublisher();
    }
  }, [deniedDevices, initLocalPublisher, audioSourceId, videoSourceId]);

  /**
   * Destroys the preview publisher
   * @returns {void}
   */
  const destroyPublisher = useCallback((target?: Publisher | null) => {
    // Destroy a specific instance when given one (so a stale [publisher]-effect cleanup tears down the
    // OLD publisher it was created for, not whatever currently occupies the ref after a recovery
    // rebuild); otherwise destroy the current publisher.
    const publisher = target ?? publisherRef.current;
    if (!publisher) return;

    attempt(() => {
      // There is a known race condition in Firefox during navigation where the DOM elements are destroyed before the publisher is destroyed, causing OT to throw an error.
      publisher.destroy();
    });
  }, []);

  /**
   * Turns the camera on and off
   * A wrapper for Publisher.publishVideo()
   * More details here: https://vonage.github.io/conversation-docs/video-js-reference/latest/Publisher.html#publishVideo
   * @returns {void}
   */
  const toggleVideo = () => {
    // A blocked camera has no video track to (un)mute; ignore until it's re-granted.
    if (!publisherRef.current || deniedDevices.camera) {
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
    // A blocked mic has no audio track to (un)mute; flipping the flag would falsely show it unmuted
    // and corrupt the persisted audio intent. Ignore until it's re-granted.
    if (!publisherRef.current || deniedDevices.microphone) {
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

  useApplyAdvancedSettings(isPublishing ? publisherRef.current : null);

  return {
    isAudioEnabled,
    initLocalPublisher,
    isPublishing,
    isAcquiring,
    isVideoEnabled,
    destroyPublisher,

    publisher: publisherRef.current,
    publisherVideoElement,
    toggleAudio,
    toggleVideo,
    changeBackground,
    backgroundFilter,
    accessStatus,
    deniedDevices,
    reacquireDevice,
    speechLevel,
    isVideoLoading,
  };
};
export default usePreviewPublisher;
