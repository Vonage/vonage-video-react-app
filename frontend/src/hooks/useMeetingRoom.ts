import { useEffect, useState, useEffectEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import usePublisherContext from './usePublisherContext';
import useSessionContext from './useSessionContext';
import useScreenShare from './useScreenShare';
import useBackgroundPublisherContext from './useBackgroundPublisherContext';
import { DEVICE_ACCESS_STATUS } from '../utils/constants';
import type { PublishingErrorType } from '../Context/PublisherProvider/usePublisher/usePublisher';
import useUserContext from './useUserContext';
import { env } from '../env';
import useMountEffect from '@web/hooks/useMountEffect';
import { runtime$ } from '@core/stores';
import useSessionKeyParam from './useSessionKeyParam';

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
    publish,
    quality,
    initializeLocalPublisher,
    publishingError,
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
      navigate(`/waiting-room/${sessionKey}`);
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

  useEffect(() => {
    if (!publisherOptions) {
      return;
    }

    if (!publisher) {
      initializeLocalPublisher(publisherOptions);
    }
  }, [initializeLocalPublisher, publisherOptions, publisher]);

  useEffect(() => {
    if (connected && publisher && publish) {
      void publish();
    }
  }, [publisher, publish, connected]);

  useEffect(() => {
    if (!backgroundPublisher) {
      void initBackgroundLocalPublisher();
    }
  }, [initBackgroundLocalPublisher, backgroundPublisher]);

  useEffect(() => {
    if (accessStatus === DEVICE_ACCESS_STATUS.ACCESS_CHANGED) {
      window.location.reload();
    }
  }, [accessStatus]);

  useRedirectOnPublisherError({
    publishingError,
    reconnecting,
    sessionKey,
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
}: {
  publishingError: PublishingErrorType | null;
  reconnecting: boolean | null;
  sessionKey: string | null;
}) {
  const navigate = useNavigate();

  const maybeRedirect = useEffectEvent(() => {
    if (!publishingError) {
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

    navigate(`/goodbye/${sessionKey ?? ''}`, {
      state: {
        header,
        caption,
      },
    });
  });

  useEffect(() => {
    maybeRedirect();
  }, [publishingError, reconnecting]);
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

    navigate(`/goodbye/${sessionKey || ''}`, {
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
