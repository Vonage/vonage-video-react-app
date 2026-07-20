import { useEffect, useRef, useState, useEffectEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import usePublisherContext from './usePublisherContext';
import useSessionContext from './useSessionContext';
import useScreenShare from './useScreenShare';
import useBackgroundPublisherContext from './useBackgroundPublisherContext';
import { DEVICE_ACCESS_STATUS } from '../utils/constants';
import { hasDeniedDevice } from '../utils/publisher/deviceAccess';
import type { DeniedDevices } from '../utils/publisher/deviceAccess';
import type { PublishingErrorType } from '../Context/PublisherProvider/usePublisher/usePublisher';
import useUserContext from './useUserContext';
import { env } from '../env';
import useMountEffect from '@web/hooks/useMountEffect';
import { runtime$ } from '@core/stores';
import useSessionKeyParam from './useSessionKeyParam';

// Grace period before ejecting to the goodbye page on a publishing error, so transient failures
// while a device is being (re)acquired can clear before we give up on the call.
const PUBLISHING_ERROR_REDIRECT_DELAY_MS = 1500;

// Stable key for a publisher device source (a deviceId string, false/null, or a MediaStreamTrack),
// used to tell whether a re-init would request the identical source set that just failed.
const sourceKey = (source: unknown): string => {
  if (typeof source === 'string') {
    return source;
  }
  if (source && typeof source === 'object') {
    return (source as { id?: string }).id ?? 'track';
  }
  return String(source);
};

const useMeetingRoom = () => {
  const videoClient = runtime$.useVideoClient();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user: {
      defaultSettings: { name },
    },
  } = useUserContext();
  const {
    publisher,
    isPublishing,
    publish,
    quality,
    initializeLocalPublisher,
    publishingError,
    deniedDevices,
    isVideoEnabled,
    publisherOptions,
  } = usePublisherContext();

  const {
    initBackgroundLocalPublisher,
    publisher: backgroundPublisher,
    accessStatus,
  } = useBackgroundPublisherContext();

  const { sessionKey, sessionKeyStatus } = useSessionKeyParam();

  const {
    joinRoom,
    subscriptionError,
    subscriberWrappers,
    connected,
    disconnect,
    reconnecting,
    rightPanelActiveTab,
    toggleChat,
    toggleParticipantList,
    toggleBackgroundEffects,
    closeRightPanel,
    toggleReportIssue,
    archiveId,
    recordingAlreadyNotified,
    archiveIdStartedBySelf,
  } = useSessionContext();

  const {
    isSharingScreen,
    isEntireScreen,
    screensharingPublisher,
    screenshareVideoElement,
    toggleShareScreen,
  } = useScreenShare();

  const [isUserCaptionsEnabled, setIsUserCaptionsEnabled] = useState<boolean>(false);
  const [captionsErrorResponse, setCaptionsErrorResponse] = useState<string | null>('');

  const [latestNotifiedArchiveId, setLatestNotifiedArchiveId] = useState<string | null>(null);
  const handleRecordingNotified = () => {
    setLatestNotifiedArchiveId(archiveId);
  };
  const shouldPromptRecordingConsent =
    !!archiveId && (archiveIdStartedBySelf === null || archiveId !== archiveIdStartedBySelf);

  const hasValidUsername = name && name.trim() !== '';
  const searchParams = new URLSearchParams(location.search);
  const bypass = searchParams.get('bypass') === 'true' || env.BYPASS_WAITING_ROOM;

  useMountEffect(() => {
    if (!hasValidUsername && !bypass) {
      void navigate(`/waiting-room/${sessionKey}`);
    }
  });

  useEffect(() => {
    if (!hasValidUsername && !bypass) return;
    if (!joinRoom || !sessionKey) return;

    /**
     * [TODO]: Reconcile sessionKey if necessary. This is needed for legacy support where the url contains only a room name.
     */
    const resolveAndJoin = async () => {
      const resolvedSessionKey = await (async () => {
        if (sessionKeyStatus === 'valid') return sessionKey;
        if (sessionKeyStatus === 'invalid') throw new Error('Invalid session key');

        /**
         * [TODO]: This is a temporary solution to support legacy vera functionality without depending on the old routers
         * If the roomName already exists, the backend will return the existing sessionKey, otherwise it will create a new session and return its sessionKey.
         */
        const session = await videoClient.createSession({ roomName: sessionKey });

        return session.sessionKey;
      })();

      await joinRoom({ sessionKey: resolvedSessionKey });
    };

    void resolveAndJoin();

    return () => {
      disconnect?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey, hasValidUsername, bypass]);

  // Signature of the device sources of the last auto-init attempt — used to stop the gate below from
  // re-initializing the identical (still-failing) request in a loop.
  const lastAttemptedSourcesRef = useRef<string | null>(null);
  useEffect(() => {
    if (!publisherOptions) {
      return;
    }

    // Clear the retry guard only once we're actually publishing (a real acquired stream) — NOT while
    // the publisher object merely exists transiently between initPublisher() and its accessDenied,
    // which would re-arm the guard mid-denial and let the re-prompt loop resume on Safari.
    if (isPublishing) {
      lastAttemptedSourcesRef.current = null;
    }
    if (publisher) {
      return;
    }

    // Re-initialize unless BOTH devices are blocked (nothing to acquire). When only one is
    // blocked we still init, requesting just the granted device (publisherOptions already excludes
    // the blocked one) so e.g. the camera stays live while the mic is blocked — Google Meet style.
    const allDevicesBlocked = deniedDevices.microphone && deniedDevices.camera;

    // Don't auto-retry the SAME requested-device set that just failed. On Chrome a denied device
    // rejects silently, but on Safari every getUserMedia re-prompts AND permissions.query is
    // unreliable (it can report the device as no longer denied), so this gate would otherwise re-init
    // the identical request forever — an endless permission prompt. A genuinely different request
    // (e.g. the video-only retry after a mic denial) has a new signature and is still allowed; the
    // user re-requests a blocked device via the badge click.
    const sourceSignature = `${sourceKey(publisherOptions.audioSource)}|${sourceKey(publisherOptions.videoSource)}`;
    const alreadyAttempted = lastAttemptedSourcesRef.current === sourceSignature;

    if (!allDevicesBlocked && !alreadyAttempted) {
      lastAttemptedSourcesRef.current = sourceSignature;
      initializeLocalPublisher(publisherOptions);
    }
  }, [initializeLocalPublisher, publisherOptions, publisher, isPublishing, deniedDevices]);

  useEffect(() => {
    if (connected && publisher && publish) {
      void publish();
    }
  }, [publisher, publish, connected]);

  useEffect(() => {
    // While the camera is blocked (REJECTED) the background publisher can't acquire it and
    // retrying would loop. On re-grant the background publisher's accessStatus flips to
    // ACCESS_CHANGED, re-opening this gate so it recovers in place — no reload.
    if (!backgroundPublisher && accessStatus !== DEVICE_ACCESS_STATUS.REJECTED) {
      void initBackgroundLocalPublisher();
    }
  }, [initBackgroundLocalPublisher, backgroundPublisher, accessStatus]);

  useRedirectOnPublisherError({
    publishingError,
    reconnecting,
    sessionKey,
    deniedDevices,
  });
  useRedirectOnSubscriberError({
    subscriberError: subscriptionError,
    reconnecting,
    sessionKey,
  });

  const isRecording = !!archiveId;
  const captionsState = {
    isUserCaptionsEnabled,
    setIsUserCaptionsEnabled,
    setCaptionsErrorResponse,
  };

  return {
    t,
    isSharingScreen,
    isEntireScreen,
    screensharingPublisher,
    screenshareVideoElement,
    toggleShareScreen,
    rightPanelActiveTab,
    toggleChat,
    toggleParticipantList,
    toggleBackgroundEffects,
    closeRightPanel,
    toggleReportIssue,
    subscriberWrappers,
    reconnecting,
    quality,
    isVideoEnabled,
    isRecording,
    isUserCaptionsEnabled,
    captionsErrorResponse,
    setCaptionsErrorResponse,
    captionsState,
    recordingAlreadyNotified,
    archiveIdStartedBySelf,
    archiveId,
    shouldPromptRecordingConsent,
    handleRecordingNotified,
    latestNotifiedArchiveId,
  };
};

/**
 * If the user is unable to publish, we redirect them to the goodbye page.
 * This prevents users from subscribing to other participants in the room, and being unable to communicate with them.
 * @param {PublishingErrorType | null} publishingError - The publishing error object or null if no error.
 */
function useRedirectOnPublisherError({
  publishingError,
  reconnecting,
  sessionKey,
  deniedDevices,
}: {
  publishingError: PublishingErrorType | null;
  reconnecting: boolean | null;
  sessionKey: string | null;
  deniedDevices: DeniedDevices;
}) {
  const navigate = useNavigate();

  const maybeRedirect = useEffectEvent(() => {
    if (!publishingError) {
      return;
    }

    // A blocked camera/microphone makes publishing fail, but that's recoverable in place (Google
    // Meet keeps you in the call) — don't eject to the goodbye page. The device is badged and
    // re-acquired on re-grant; publishingError clears once a track publishes again.
    if (hasDeniedDevice(deniedDevices)) {
      return;
    }

    const isBrowserOnline = (() => {
      if (typeof navigator === 'undefined') return true;
      return navigator.onLine;
    })();

    if (reconnecting === true || isBrowserOnline === false) {
      return;
    }

    const { header, caption } = publishingError;

    void navigate(`/goodbye/${sessionKey ?? ''}`, {
      state: {
        header,
        caption,
      },
    });
  });

  // Key the timer off whether an error is *active*, not its object identity: a publisher failing
  // in a loop re-sets publishingError repeatedly, and depending on the object would keep resetting
  // the timer and delay a genuine redirect indefinitely.
  const hasPublishingError = publishingError !== null;

  useEffect(() => {
    if (!hasPublishingError) {
      return;
    }
    // Defer the ejection so transient publish failures during device (re)acquisition can resolve
    // first — e.g. revoking then re-granting a device mid-call briefly fails publishing before the
    // track re-publishes (handleStreamCreated clears publishingError) or the denial is detected.
    // A genuinely persistent failure still redirects after the delay.
    const timer = setTimeout(maybeRedirect, PUBLISHING_ERROR_REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [hasPublishingError, reconnecting]);
}

/**
 * If the user is unable to subscribe, we redirect them to the goodbye page.
 * This prevents users from subscribing to other participants in the room, and being unable to communicate with them.
 * @param {Error | null} subscriberError - The subscriber error object or null if no error.
 */
function useRedirectOnSubscriberError({
  subscriberError,
  reconnecting,
  sessionKey,
}: {
  subscriberError: Error | null;
  reconnecting: boolean | null;
  sessionKey: string | null;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const maybeRedirect = useEffectEvent(() => {
    if (!subscriberError) {
      return;
    }

    const isBrowserOnline = (() => {
      if (typeof navigator === 'undefined') return true;
      return navigator.onLine;
    })();

    if (reconnecting === true || isBrowserOnline === false) {
      return;
    }

    void navigate(`/goodbye/${sessionKey || ''}`, {
      state: {
        header: t('subscribingErrors.blocked.title'),
        caption: t('subscribingErrors.blocked.message'),
      },
    });
  });

  useEffect(() => {
    maybeRedirect();
  }, [subscriberError, reconnecting]);
}

export default useMeetingRoom;
