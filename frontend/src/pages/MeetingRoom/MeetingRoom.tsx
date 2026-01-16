import { useEffect, ReactElement, useState, useEffectEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Box from '@ui/Box';
import useTheme from '@ui/theme';
import usePublisherContext from '../../hooks/usePublisherContext';
import ConnectionAlert from '../../components/MeetingRoom/ConnectionAlert';
import Toolbar from '../../components/MeetingRoom/Toolbar';
import useSessionContext from '../../hooks/useSessionContext';
import useScreenShare from '../../hooks/useScreenShare';
import VideoTileCanvas from '../../components/MeetingRoom/VideoTileCanvas';
import SmallViewportHeader from '../../components/MeetingRoom/SmallViewportHeader';
import EmojisOrigin from '../../components/MeetingRoom/EmojisOrigin';
import RightPanel from '../../components/MeetingRoom/RightPanel';
import useRoomName from '../../hooks/useRoomName';
import isValidRoomName from '../../utils/isValidRoomName';
import usePublisherOptions from '../../Context/PublisherProvider/usePublisherOptions';
import CaptionsBox from '../../components/MeetingRoom/CaptionsButton/CaptionsBox';
import useIsSmallViewport from '../../hooks/useIsSmallViewport';
import CaptionsError from '../../components/MeetingRoom/CaptionsError';
import useBackgroundPublisherContext from '../../hooks/useBackgroundPublisherContext';
import { DEVICE_ACCESS_STATUS } from '../../utils/constants';
import type { PublishingErrorType } from '../../Context/PublisherProvider/usePublisher/usePublisher';
import useUserContext from '../../hooks/useUserContext';
import env from '../../env';
import useMountEffect from '@common/hooks/useMountEffect';

/**
 * MeetingRoom Component
 *
 * This component renders the meeting room page of the application, including:
 * - All other users in the room (some may be hidden) and a screenshare (if applicable).
 * - A video preview of the user and a preview of their screenshare (if applicable).
 * - A toolbar to control user media, adjust room properties, and set viewing options.
 * @returns {ReactElement} - The meeting room.
 */
const MeetingRoom = (): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const roomName = useRoomName();
  const {
    user: {
      defaultSettings: { name },
    },
  } = useUserContext();
  const { publisher, publish, quality, initializeLocalPublisher, publishingError, isVideoEnabled } =
    usePublisherContext();

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
  } = useSessionContext();
  const { isSharingScreen, screensharingPublisher, screenshareVideoElement, toggleShareScreen } =
    useScreenShare();
  const publisherOptions = usePublisherOptions();
  const isSmallViewport = useIsSmallViewport();

  const [isUserCaptionsEnabled, setIsUserCaptionsEnabled] = useState<boolean>(false);
  const [captionsErrorResponse, setCaptionsErrorResponse] = useState<string | null>('');
  const captionsState = {
    isUserCaptionsEnabled,
    setIsUserCaptionsEnabled,
    setCaptionsErrorResponse,
  };

  const hasValidUsername = name && name.trim() !== '';
  const searchParams = new URLSearchParams(location.search);
  const bypass = searchParams.get('bypass') === 'true' || env.VITE_BYPASS_WAITING_ROOM; // Testing purpose

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
      joinRoom(roomName);
    }
    return () => {
      // Ensure to disconnect session when unmounting meeting room in order
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
      publish();
    }
  }, [publisher, publish, connected]);

  useEffect(() => {
    if (!backgroundPublisher) {
      initBackgroundLocalPublisher();
    }
  }, [initBackgroundLocalPublisher, backgroundPublisher]);

  // After changing device permissions, reload the page to reflect the device's permission change.
  useEffect(() => {
    if (accessStatus === DEVICE_ACCESS_STATUS.ACCESS_CHANGED) {
      window.location.reload();
    }
  }, [accessStatus]);

  useRedirectOnPublisherError({ publishingError, reconnecting });

  useRedirectOnSubscriberError({ subscriberError: subscriptionError, reconnecting });

  return (
    <Box
      data-testid="meetingRoom"
      sx={{
        height: 'calc(100dvh - 80px)',
        width: '100vw',
        backgroundColor: theme.colors.darkBackground,
      }}
    >
      {isSmallViewport && <SmallViewportHeader />}
      <VideoTileCanvas
        isSharingScreen={isSharingScreen}
        screensharingPublisher={screensharingPublisher}
        screenshareVideoElement={screenshareVideoElement}
        isRightPanelOpen={rightPanelActiveTab !== 'closed'}
      />
      <RightPanel activeTab={rightPanelActiveTab} handleClose={closeRightPanel} />
      <EmojisOrigin />
      {isUserCaptionsEnabled && <CaptionsBox />}
      {captionsErrorResponse && (
        <CaptionsError
          captionsErrorResponse={captionsErrorResponse}
          setCaptionsErrorResponse={setCaptionsErrorResponse}
        />
      )}
      <Toolbar
        isSharingScreen={isSharingScreen}
        toggleShareScreen={toggleShareScreen}
        rightPanelActiveTab={rightPanelActiveTab}
        toggleParticipantList={toggleParticipantList}
        toggleBackgroundEffects={toggleBackgroundEffects}
        toggleChat={toggleChat}
        toggleReportIssue={toggleReportIssue}
        participantCount={
          subscriberWrappers.filter(({ isScreenshare }) => !isScreenshare).length + 1
        }
        captionsState={captionsState}
      />
      {reconnecting && (
        <ConnectionAlert
          title={t('connectionAlert.reconnecting.title')}
          message={t('connectionAlert.reconnecting.message')}
          severity="error"
        />
      )}
      {!reconnecting && quality !== 'good' && isVideoEnabled && (
        <ConnectionAlert
          closable
          title={t('connectionAlert.quality.title')}
          message={t('connectionAlert.quality.message')}
          severity="warning"
        />
      )}
    </Box>
  );
};

/**
 *  If the user is unable to publish, we redirect them to the goodbye page.
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
      // Network changes are often transient; don't redirect during reconnection/offline.
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
 *  If the user is unable to subscribe, we redirect them to the goodbye page.
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

export default MeetingRoom;
