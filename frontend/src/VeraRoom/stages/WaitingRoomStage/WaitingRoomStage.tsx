import { type FC } from 'react';
import { Navigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import bridge$ from '../../stores/bridge';
import { PreviewPublisherProvider } from '@Context/PreviewPublisherProvider';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import useWaitingRoom from '@hooks/useWaitingRoom';
import { Box } from '@mui/material';
import DeviceAccessAlert from '@components/DeviceAccessAlert';
import { DEVICE_ACCESS_STATUS } from '@utils/constants';
import UsernameInputSkeleton from '@components/WaitingRoom/UserNameInput/UserNameInput.skeleton';
import UsernameInput from '@components/WaitingRoom/UserNameInput';
import VideoContainerSkeleton from '@components/WaitingRoom/VideoContainer/VideoContainer.skeleton';
import ControlPanel from '@components/WaitingRoom/ControlPanel';
import VideoContainer from '@components/WaitingRoom/VideoContainer';
import { PageLayoutEmbed } from '@ui';

/**
 * WaitingRoomStage
 *
 * Embeddable version of the waiting room. Equivalent to WaitingRoom but without
 * the Vera chrome (Banner, Footer). Provides its own PreviewPublisherProvider.
 *
 * Navigation to the meeting room is handled by UsernameInput via react-router-dom,
 * which resolves against the parent MemoryRouter in VeraRoom.
 *
 * If mounted at /waiting-room (no :roomIdentifier param) but bridge$ has a sessionIdentifier,
 * redirects to /waiting-room/:sessionIdentifier so useRoomName() resolves correctly.
 */
const WaitingRoomStage: FC = () => {
  const sessionIdentifier = bridge$.use.select((state) => state.sessionIdentifier);

  const missingRoomIdentifier = !sessionIdentifier;
  const canRedirect = missingRoomIdentifier && !!sessionIdentifier;
  const isConfigError = missingRoomIdentifier && !sessionIdentifier;

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

function WaitingRoomStageContent() {
  const {
    anchorEl,
    openAudioInput,
    openVideoInput,
    openAudioOutput,
    username,
    setUsername,
    accessStatus,
    isRoomReady,
    roomName,
    handleAudioInputOpen,
    handleVideoInputOpen,
    handleAudioOutputOpen,
    handleClose,
  } = useWaitingRoom();

  return (
    <backgroundEffectsDialog$.Provider>
      <precallNetworkTestDialog$.Provider>
        <Box data-testid="waitingRoom" sx={{ height: '100%' }}>
          <PageLayoutEmbed>
            <PageLayoutEmbed.Left>
              <Box
                className={`relative flex flex-col sm:inline-flex h-auto max-w-full animate-fade-in`}
              >
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
            </PageLayoutEmbed.Left>

            <PageLayoutEmbed.Right>
              {isRoomReady && (
                <UsernameInput
                  className={`flex-col sm:inline-flex h-auto animate-fade-in`}
                  username={username}
                  setUsername={setUsername}
                  roomName={roomName}
                />
              )}

              {!isRoomReady && <UsernameInputSkeleton />}
            </PageLayoutEmbed.Right>
          </PageLayoutEmbed>
          {accessStatus !== DEVICE_ACCESS_STATUS.ACCEPTED && (
            <DeviceAccessAlert accessStatus={accessStatus} />
          )}
        </Box>
      </precallNetworkTestDialog$.Provider>
    </backgroundEffectsDialog$.Provider>
  );
}

export default WaitingRoomStage;
