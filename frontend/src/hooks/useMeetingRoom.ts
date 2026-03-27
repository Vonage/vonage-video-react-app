import { useEffect, useState, useEffectEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import usePublisherContext from './usePublisherContext';
import useSessionContext from './useSessionContext';
import useScreenShare from './useScreenShare';
import useRoomName from './useRoomName';
import isValidRoomName from '../utils/isValidRoomName';
import useIsSmallViewport from './useIsSmallViewport';
import useBackgroundPublisherContext from './useBackgroundPublisherContext';
import { DEVICE_ACCESS_STATUS } from '../utils/constants';
import type { PublishingErrorType } from '../Context/PublisherProvider/usePublisher/usePublisher';
import useUserContext from './useUserContext';
import { env } from '../env';
import useMountEffect from '@web/hooks/useMountEffect';

const useMeetingRoom = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const roomName = useRoomName();
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

  const { isSharingScreen, screensharingPublisher, screenshareVideoElement, toggleShareScreen } =
    useScreenShare();

  const isSmallViewport = useIsSmallViewport();

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
      navigate(`/waiting-room/${roomName}`);
    }
  });

  useEffect(() => {
    if (!hasValidUsername && !bypass) {
      return;
    }

    if (joinRoom && isValidRoomName(roomName)) {
      void joinRoom(roomName);
    }
    return () => {
      disconnect?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName, hasValidUsername, bypass]);

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

  useRedirectOnPublisherError({ publishingError, reconnecting });
  useRedirectOnSubscriberError({ subscriberError: subscriptionError, reconnecting });

  const isRecording = !!archiveId;
  const captionsState = {
    isUserCaptionsEnabled,
    setIsUserCaptionsEnabled,
    setCaptionsErrorResponse,
  };

  return {
    t,
    isSmallViewport,
    isSharingScreen,
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
}: {
  publishingError: PublishingErrorType | null;
  reconnecting: boolean | null;
}) {
  const navigate = useNavigate();
  const roomName = useRoomName();

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

    navigate('/goodbye', {
      state: {
        header,
        caption,
        roomName,
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
}: {
  subscriberError: Error | null;
  reconnecting: boolean | null;
}) {
  const navigate = useNavigate();
  const roomName = useRoomName();
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

    navigate('/goodbye', {
      state: {
        header: t('subscribingErrors.blocked.title'),
        caption: t('subscribingErrors.blocked.message'),
        roomName,
      },
    });
  });

  useEffect(() => {
    maybeRedirect();
  }, [subscriberError, reconnecting]);
}

export default useMeetingRoom;
