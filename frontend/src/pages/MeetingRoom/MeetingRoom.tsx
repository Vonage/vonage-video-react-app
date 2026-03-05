import type { ReactElement } from 'react';
import Box from '@mui/material/Box';
import ConnectionAlert from '../../components/MeetingRoom/ConnectionAlert';
import Toolbar from '../../components/MeetingRoom/Toolbar';
import VideoTileCanvas from '../../components/MeetingRoom/VideoTileCanvas';
import SmallViewportHeader from '../../components/MeetingRoom/SmallViewportHeader';
import EmojisOrigin from '../../components/MeetingRoom/EmojisOrigin';
import RightPanel from '../../components/MeetingRoom/RightPanel';
import CaptionsBox from '../../components/MeetingRoom/CaptionsButton/CaptionsBox';
import CaptionsError from '../../components/MeetingRoom/CaptionsError';
import classNames from 'classnames';
import useMeetingRoom from '../../hooks/useMeetingRoom';

/**
 * MeetingRoom Component
 *
 * This component renders the meeting room page of the application, including:
 * - All other users in the room (some may be hidden) and a screenshare (if applicable).
 * - A video preview of the user and a preview of their screenshare (if applicable).
 * - A toolbar to control user media, adjust room properties, and set viewing options.
 * @returns {ReactElement} - The meeting room.
 */
const MeetingRoom = ({
  className,
  fullSize = false,
}: {
  className?: string;
  fullSize?: boolean;
}): ReactElement => {
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
    subscriberWrappers,
    reconnecting,
    quality,
    isVideoEnabled,
    isRecording,
    isUserCaptionsEnabled,
    captionsErrorResponse,
    setCaptionsErrorResponse,
    captionsState,
  } = useMeetingRoom();

  return (
    <Box
      data-testid="meetingRoom"
      className={classNames(
        className ?? 'h-[calc(100dvh-80px)] w-screen',
        'bg-vera-dark-background',
        {
          recording: isRecording,
        }
      )}
    >
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

export default MeetingRoom;
