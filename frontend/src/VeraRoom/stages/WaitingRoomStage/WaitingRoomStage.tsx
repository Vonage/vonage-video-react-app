import {
  useState,
  useEffect,
  type MouseEvent,
  type TouchEvent,
  type FC,
  useEffectEvent,
} from 'react';
import { Navigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PreviewPublisherProvider } from '@Context/PreviewPublisherProvider';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import useBackgroundPublisherContext from '@hooks/useBackgroundPublisherContext';
import ControlPanel from '@components/WaitingRoom/ControlPanel';
import VideoContainer from '@components/WaitingRoom/VideoContainer';
import UsernameInput from '@components/WaitingRoom/UserNameInput';
import VideoContainerSkeleton from '@components/WaitingRoom/VideoContainer/VideoContainer.skeleton';
import UsernameInputSkeleton from '@components/WaitingRoom/UserNameInput/UserNameInput.skeleton';
import DeviceAccessAlert from '@components/DeviceAccessAlert';
import { DEVICE_ACCESS_STATUS } from '@utils/constants';
import { getStorageItem, STORAGE_KEYS } from '@utils/storage';
import appConfig$ from '@stores/appConfig';
import bridge$ from '../../stores/bridge';

/**
 * Inner content — must be rendered inside PreviewPublisherProvider.
 */
const WaitingRoomStageContent: FC = () => {
  const { initLocalPublisher, publisher, accessStatus, destroyPublisher, isVideoLoading } =
    usePreviewPublisherContext();

  const { initBackgroundLocalPublisher, publisher: backgroundPublisher } =
    useBackgroundPublisherContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openAudioInput, setOpenAudioInput] = useState(false);
  const [openVideoInput, setOpenVideoInput] = useState(false);
  const [openAudioOutput, setOpenAudioOutput] = useState(false);
  const [username, setUsername] = useState(getStorageItem(STORAGE_KEYS.USERNAME) ?? '');

  const allowDeviceSelection = appConfig$.use.select(
    ({ waitingRoomSettings }) => waitingRoomSettings.allowDeviceSelection
  );

  const stableInitLocalPublisher = useEffectEvent(() => {
    if (!publisher) {
      initLocalPublisher();
    }

    return () => {
      if (publisher) {
        destroyPublisher();
      }
    };
  });

  useEffect(() => {
    return stableInitLocalPublisher();
  }, [publisher]);

  useEffect(() => {
    if (!backgroundPublisher) {
      initBackgroundLocalPublisher();
    }
  }, [initBackgroundLocalPublisher, backgroundPublisher]);

  const handleAudioInputOpen = (
    event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
    setOpenAudioInput(true);
  };

  const handleVideoInputOpen = (
    event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
    setOpenVideoInput(true);
  };

  const handleAudioOutputOpen = (
    event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
    setOpenAudioOutput(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenAudioInput(false);
    setOpenAudioOutput(false);
    setOpenVideoInput(false);
  };

  const isRoomReady =
    allowDeviceSelection && accessStatus === DEVICE_ACCESS_STATUS.ACCEPTED && !isVideoLoading;

  return (
    <backgroundEffectsDialog$.Provider>
      <precallNetworkTestDialog$.Provider>
        <Box
          data-testid="waitingRoomStage"
          className="flex flex-col md:flex-row gap-6 p-6 h-full w-full overflow-auto"
        >
          <Box className="flex flex-col gap-4 flex-1 items-center justify-center">
            {isRoomReady && (
              <>
                <VideoContainer username={username} />
                <ControlPanel
                  handleAudioInputOpen={handleAudioInputOpen}
                  handleVideoInputOpen={handleVideoInputOpen}
                  handleAudioOutputOpen={handleAudioOutputOpen}
                  handleClose={handleClose}
                  openAudioInput={openAudioInput}
                  openVideoInput={openVideoInput}
                  openAudioOutput={openAudioOutput}
                  anchorEl={anchorEl}
                />
              </>
            )}

            {!isRoomReady && <VideoContainerSkeleton />}
          </Box>

          <Box className="flex flex-col flex-1 items-center justify-center">
            {isRoomReady && (
              <UsernameInput
                className="flex-col sm:inline-flex h-auto sm:h-100 animate-fade-in"
                username={username}
                setUsername={setUsername}
              />
            )}

            {!isRoomReady && <UsernameInputSkeleton />}
          </Box>
        </Box>

        {accessStatus !== DEVICE_ACCESS_STATUS.ACCEPTED && (
          <DeviceAccessAlert accessStatus={accessStatus} />
        )}
      </precallNetworkTestDialog$.Provider>
    </backgroundEffectsDialog$.Provider>
  );
};

/**
 * WaitingRoomStage
 *
 * Embeddable version of the waiting room. Equivalent to WaitingRoom but without
 * the Vera chrome (Banner, Footer). Provides its own PreviewPublisherProvider.
 *
 * Navigation to the meeting room is handled by UsernameInput via react-router-dom,
 * which resolves against the parent MemoryRouter in VeraRoom.
 *
 * If mounted at /waiting-room (no :roomName param) but bridge$ has a sessionIdentifier,
 * redirects to /waiting-room/:sessionIdentifier so useRoomName() resolves correctly.
 */
const WaitingRoomStage: FC = () => {
  const { roomName } = useParams<{ roomName?: string }>();
  const sessionIdentifier = bridge$.use.select((state) => state.sessionIdentifier);

  const missingRoomName = !roomName;
  const canRedirect = missingRoomName && !!sessionIdentifier;
  const isConfigError = missingRoomName && !sessionIdentifier;

  if (canRedirect) {
    return <Navigate to={`/waiting-room/${sessionIdentifier}`} replace />;
  }

  if (isConfigError) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <Typography className="text-vera-tertiary text-center">
          Set the <code>session-identifier</code> attribute to specify the room to join.
        </Typography>
      </div>
    );
  }

  return (
    <PreviewPublisherProvider>
      <WaitingRoomStageContent />
    </PreviewPublisherProvider>
  );
};

export default WaitingRoomStage;
