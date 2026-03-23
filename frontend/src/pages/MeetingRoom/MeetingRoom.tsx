import { useEffect, ReactElement, useState, useEffectEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import useTheme from '@ui/theme';
import usePublisherContext from '../../hooks/usePublisherContext';
import PopupAlert from '../../components/MeetingRoom/PopupAlert';
import type { ReactElement } from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import ConnectionAlert from '../../components/MeetingRoom/ConnectionAlert';
import Toolbar from '../../components/MeetingRoom/Toolbar';
import VideoTileCanvas from '../../components/MeetingRoom/VideoTileCanvas';
import SmallViewportHeader from '../../components/MeetingRoom/SmallViewportHeader';
import EmojisOrigin from '../../components/MeetingRoom/EmojisOrigin';
import RightPanel from '../../components/MeetingRoom/RightPanel';
import CaptionsBox from '../../components/MeetingRoom/CaptionsButton/CaptionsBox';
import CaptionsError from '../../components/MeetingRoom/CaptionsError';
import useBackgroundPublisherContext from '../../hooks/useBackgroundPublisherContext';
import { DEVICE_ACCESS_STATUS, RECORDING_POPUP_TIMEOUT_MS } from '@utils/constants';
import type { PublishingErrorType } from '../../Context/PublisherProvider/usePublisher/usePublisher';
import useUserContext from '../../hooks/useUserContext';
import { env } from '../../env';
import RecordingPopUpIndicator from '@components/MeetingRoom/RecordingPopupIndicator';
import useMountEffect from '@web/hooks/useMountEffect';
import classNames from 'classnames';
import useMeetingRoom from '../../hooks/useMeetingRoom';
import { twMerge } from 'tailwind-merge';
import RecordingIndicator from '../../components/MeetingRoom/RecordingIndicator';

/**
 * MeetingRoom Component
 *
 * This component renders the meeting room page of the application, including:
 * - All other users in the room (some may be hidden) and a screenshare (if applicable).
 * - A video preview of the user and a preview of their screenshare (if applicable).
 * - A toolbar to control user media, adjust room properties, and set viewing options.
 * @returns {ReactElement} - The meeting room.
 */
type MeetingRoomProps = BoxProps & {
  fullSize?: boolean;
};

const MeetingRoom = ({
  fullSize = false,
  className,
  // ...props
}: MeetingRoomProps): ReactElement => {
  const {
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
    archiveId,
    archiveIdStartedBySelf,
    recordingAlreadyNotified,
  } = useSessionContext();
  const { isSharingScreen, screensharingPublisher, screenshareVideoElement, toggleShareScreen } =
    useScreenShare();
  const isSmallViewport = useIsSmallViewport();

  const [isUserCaptionsEnabled, setIsUserCaptionsEnabled] = useState<boolean>(false);
  const [captionsErrorResponse, setCaptionsErrorResponse] = useState<string | null>('');
  const captionsState = {
    subscriberWrappers,
    reconnecting,
    quality,
    isVideoEnabled,
    isRecording,
    isUserCaptionsEnabled,
    captionsErrorResponse,
    setCaptionsErrorResponse,
  };

  const hasValidUsername = name && name.trim() !== '';
  const searchParams = new URLSearchParams(location.search);
  const bypass = searchParams.get('bypass') === 'true' || env.BYPASS_WAITING_ROOM; // Testing purpose

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
      void publish();
    }
  }, [publisher, publish, connected]);

  useEffect(() => {
    if (!backgroundPublisher) {
      void initBackgroundLocalPublisher();
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

  const shouldPromptRecordingConsent =
    !!archiveId && (archiveIdStartedBySelf === null || archiveId !== archiveIdStartedBySelf);

  const isRecording = !!archiveId;
    captionsState,
  } = useMeetingRoom();

  const [latestNotifiedArchiveId, setLatestNotifiedArchiveId] = useState<string | null>(null);

  const handleRecordingNotified = () => {
    setLatestNotifiedArchiveId(archiveId);
  };

  return (
    <Box
      data-testid="meetingRoom"
      className={classNames(
        twMerge('h-[calc(100dvh-80px)] w-screen bg-vera-dark-background', className),
        {
          recording: isRecording,
        }
      )}
    >
      {isRecording && !isSmallViewport && (
        <Box
          data-testid="meetingRoomRecordingIndicatorContainer"
          className="pointer-events-none absolute left-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-vera-dark-grey-opacity backdrop-blur-sm"
        >
          <RecordingIndicator />
        </Box>
      )}

      {isSmallViewport && <SmallViewportHeader />}

      <VideoTileCanvas
        isSharingScreen={isSharingScreen}
        screensharingPublisher={screensharingPublisher}
        screenshareVideoElement={screenshareVideoElement}
        isRightPanelOpen={rightPanelActiveTab !== 'closed'}
        fullSize={fullSize}
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
      {!recordingAlreadyNotified && (
        <RecordingPopUpIndicator
          shouldPromptRecordingConsent={shouldPromptRecordingConsent}
          onNotified={handleRecordingNotified}
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
      {recordingAlreadyNotified &&
        !archiveIdStartedBySelf &&
        isRecording &&
        archiveId !== latestNotifiedArchiveId && (
          <PopupAlert
            title={t('recording.popup.title')}
            message={t('recording.popup.subtitle')}
            severity="info"
            timeout={RECORDING_POPUP_TIMEOUT_MS}
          />
        )}
      {reconnecting && (
        <PopupAlert
          title={t('connectionAlert.reconnecting.title')}
          message={t('connectionAlert.reconnecting.message')}
          severity="error"
        />
      )}
      {!reconnecting && quality !== 'good' && isVideoEnabled && (
        <PopupAlert
          closable
          title={t('connectionAlert.quality.title')}
          message={t('connectionAlert.quality.message')}
          severity="warning"
        />
      )}
    </Box>
  );
};

export default MeetingRoom;
