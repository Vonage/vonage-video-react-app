import type { ReactElement } from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import advancedSettings$ from '@Context/AdvancedSettings';
import AdvancedSettingsDialog from '@components/AdvancedSettings/Dialog';
import PopupAlert from '@components/MeetingRoom/PopupAlert';
import Toolbar from '../../components/MeetingRoom/Toolbar';
import VideoTileCanvas from '../../components/MeetingRoom/VideoTileCanvas';
import SmallViewportHeader from '../../components/MeetingRoom/SmallViewportHeader';
import EmojisOrigin from '../../components/MeetingRoom/EmojisOrigin';
import RightPanel from '../../components/MeetingRoom/RightPanel';
import CaptionsBox from '../../components/MeetingRoom/CaptionsButton/CaptionsBox';
import CaptionsError from '../../components/MeetingRoom/CaptionsError';
import classNames from 'classnames';
import useMeetingRoom from '../../hooks/useMeetingRoom';
import { twMerge } from 'tailwind-merge';
import RecordingIndicator from '../../components/MeetingRoom/RecordingIndicator';
import RecordingPopUpIndicator from '@components/MeetingRoom/RecordingPopupIndicator';
import { RECORDING_POPUP_TIMEOUT_MS } from '@utils/constants';
import { isMobile } from '@web/platform';

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

const isMobileDevice = isMobile();

function MeetingRoom({ fullSize = false, className, ...boxProps }: MeetingRoomProps): ReactElement {
  const {
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
    latestNotifiedArchiveId,
    handleRecordingNotified,
  } = useMeetingRoom();
  const isAdvancedSettingsOpen = advancedSettings$.use.select((state) => state.isOpen);

  return (
    <Box
      data-testid="meetingRoom"
      {...boxProps}
      className={classNames(
        twMerge('h-[calc(100dvh-80px)] w-screen bg-vera-dark-background', className),
        {
          recording: isRecording,
        }
      )}
    >
      {isRecording && !isMobileDevice && (
        <Box
          data-testid="meetingRoomRecordingIndicatorContainer"
          className="pointer-events-none absolute left-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-vera-dark-grey-opacity backdrop-blur-sm"
        >
          <RecordingIndicator />
        </Box>
      )}

      {isMobileDevice && <SmallViewportHeader />}

      <VideoTileCanvas
        isSharingScreen={isSharingScreen}
        isEntireScreen={isEntireScreen}
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
      {isAdvancedSettingsOpen && <AdvancedSettingsDialog />}
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
}

export default MeetingRoom;
