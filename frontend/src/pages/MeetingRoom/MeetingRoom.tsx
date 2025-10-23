import { useEffect, ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSuspenseUntilAppConfigReady from '@Context/AppConfig/hooks/useSuspenseUntilAppConfigReady';
import usePublisherContext from '@hooks/usePublisherContext';
import ConnectionAlert from '@components/MeetingRoom/ConnectionAlert';
import Toolbar from '@components/MeetingRoom/Toolbar';
import useSessionContext from '@hooks/useSessionContext';
import useScreenShare from '@hooks/useScreenShare';
import VideoTileCanvas from '@components/MeetingRoom/VideoTileCanvas';
import SmallViewportHeader from '@components/MeetingRoom/SmallViewportHeader';
import EmojisOrigin from '@components/MeetingRoom/EmojisOrigin';
import RightPanel from '@components/MeetingRoom/RightPanel';
import useRoomName from '@hooks/useRoomName';
import isValidRoomName from '@utils/isValidRoomName';
import usePublisherOptions from '@Context/PublisherProvider/usePublisherOptions';
import CaptionsBox from '@components/MeetingRoom/CaptionsButton/CaptionsBox';
import useIsSmallViewport from '@hooks/useIsSmallViewport';
import CaptionsError from '@components/MeetingRoom/CaptionsError';
import useBackgroundPublisherContext from '@hooks/useBackgroundPublisherContext';
import { DEVICE_ACCESS_STATUS } from '@utils/constants';
import type { PublishingErrorType } from '@Context/PublisherProvider/usePublisher/usePublisher';
import useIsCameraControlAllowed from '@Context/AppConfig/hooks/useIsCameraControlAllowed';
import useIsMicrophoneControlAllowed from '@Context/AppConfig/hooks/useIsMicrophoneControlAllowed';
import useIsBackgroundEffectsAllowed from '@Context/AppConfig/hooks/useIsBackgroundEffectsAllowed';

export const height = '@apply h-[calc(100dvh_-_80px)]';

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
  useSuspenseUntilAppConfigReady();

  const { t } = useTranslation();
  const roomName = useRoomName();

  const {
    publisher,
    publish,
    quality,
    initializeLocalPublisher,
    publishingError,
    isVideoEnabled,
    isAudioEnabled,
    publisherOptions,
  } = usePublisherContext();

  const isCameraAllowed = useIsCameraControlAllowed();
  const isMicrophoneAllowed = useIsMicrophoneControlAllowed();
  const isBackgroundEffectsAllowed = useIsBackgroundEffectsAllowed();

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
      debugger;

      initializeLocalPublisher(publisherOptions);
    }
  }, [initializeLocalPublisher, publisherOptions, publisher]);

  useEffect(() => {
    if (connected && publisher && publish) {
      publish();
    }
  }, [publisher, publish, connected]);

  useEffect(() => {
    const shouldInitializeVideoSource =
      isBackgroundEffectsAllowed && isCameraAllowed && isVideoEnabled;

    if (!backgroundPublisher && shouldInitializeVideoSource) {
      console.log('Initializing background publisher');
      initBackgroundLocalPublisher();
    }
  }, [
    initBackgroundLocalPublisher,
    backgroundPublisher,
    isCameraAllowed,
    isVideoEnabled,
    isBackgroundEffectsAllowed,
  ]);

  // // After changing device permissions, reload the page to reflect the device's permission change.
  // useEffect(() => {
  //   if (accessStatus === DEVICE_ACCESS_STATUS.ACCESS_CHANGED) {
  //     window.location.reload();
  //   }
  // }, [accessStatus]);

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  useRedirectOnPublisherError(publishingError);

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  useRedirectOnSubscriberError(subscriptionError);

  return (
    <div data-testid="meetingRoom" className={`${height} w-screen bg-darkGray-100`}>
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
    </div>
  );
};

/**
 *  If the user is unable to publish, we redirect them to the goodbye page.
 * This prevents users from subscribing to other participants in the room, and being unable to communicate with them.
 * @param {PublishingErrorType | null} publishingError - The publishing error object or null if no error.
 */
function useRedirectOnPublisherError(publishingError: PublishingErrorType | null) {
  const navigate = useNavigate();
  const roomName = useRoomName();
  const { t } = useTranslation();

  useEffect(() => {
    if (!publishingError) {
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
  }, [publishingError, navigate, roomName, t]);
}

/**
 *  If the user is unable to subscribe, we redirect them to the goodbye page.
 * This prevents users from subscribing to other participants in the room, and being unable to communicate with them.
 * @param {Error | null} subscriberError - The subscriber error object or null if no error.
 */
function useRedirectOnSubscriberError(subscriberError: Error | null) {
  const navigate = useNavigate();
  const roomName = useRoomName();
  const { t } = useTranslation();

  useEffect(() => {
    if (!subscriberError) {
      return;
    }

    navigate('/goodbye', {
      state: {
        header: t('subscribingErrors.blocked.title'),
        caption: t('subscribingErrors.blocked.message'),
        roomName,
      },
    });
  }, [subscriberError, navigate, roomName, t]);
}

export default MeetingRoom;
