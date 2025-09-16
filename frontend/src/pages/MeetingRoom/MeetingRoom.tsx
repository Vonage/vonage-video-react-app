import { useEffect, ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const height = '@apply h-[calc(100dvh_-_80px)]';

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
  const roomName = useRoomName();
  const { publisher, publish, quality, initializeLocalPublisher, publishingError, isVideoEnabled } =
    usePublisherContext();

  const {
    initBackgroundLocalPublisher,
    publisher: backgroundPublisher,
    accessStatus,
  } = useBackgroundPublisherContext();

  const {
    joinRoom,
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
  const navigate = useNavigate();
  const publisherOptions = usePublisherOptions();
  const isSmallViewport = useIsSmallViewport();

  const [isUserCaptionsEnabled, setIsUserCaptionsEnabled] = useState<boolean>(false);
  const [captionsErrorResponse, setCaptionsErrorResponse] = useState<string | null>('');
  const captionsState = {
    isUserCaptionsEnabled,
    setIsUserCaptionsEnabled,
    setCaptionsErrorResponse,
  };

  useEffect(() => {
    if (joinRoom && isValidRoomName(roomName)) {
      joinRoom(roomName);
    }
    return () => {
      // Ensure to disconnect session when unmounting meeting room in order
      disconnect?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName]);

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

  // If the user is unable to publish, we redirect them to the goodbye page.
  // This prevents users from subscribing to other participants in the room, and being unable to communicate with them.
  useEffect(() => {
    if (publishingError) {
      const { header, caption } = publishingError;
      navigate('/goodbye', {
        state: {
          header,
          caption,
          roomName,
        },
      });
    }
  }, [publishingError, navigate, roomName]);

  return (
    <div data-testid="meetingRoom" className={`${height} w-screen bg-darkGray-100`}>
      {isSmallViewport && <SmallViewportHeader />}
      <VideoTileCanvas
        isSharingScreen={isSharingScreen}
        screensharingPublisher={screensharingPublisher}
        screenshareVideoElement={screenshareVideoElement}
        isRightPanelOpen={rightPanelActiveTab !== 'closed'}
        toggleParticipantList={toggleParticipantList}
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
          title="Lost connection"
          message="Please verify your network connection"
          severity="error"
        />
      )}
      {!reconnecting && quality !== 'good' && isVideoEnabled && (
        <ConnectionAlert
          closable
          title="Video quality problem"
          message="Please check your connectivity. Your video may be disabled to improve the user experience"
          severity="warning"
        />
      )}
    </div>
  );
};

export default MeetingRoom;
