import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import VividIcon from '@components/VividIcon';
import PageLayout from '@ui/PageLayout';
import Banner from '@components/Banner';
import Footer from '@components/Footer/Footer';
import ControlPanel from '@components/WaitingRoom/ControlPanel';
import VideoContainer from '@components/WaitingRoom/VideoContainer';
import UsernameInput from '@components/WaitingRoom/UserNameInput';
import DeviceAccessAlert from '@components/DeviceAccessAlert';
import { DEVICE_ACCESS_STATUS } from '@utils/constants';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import VideoContainerSkeleton from '@components/WaitingRoom/VideoContainer/VideoContainer.skeleton';
import UsernameInputSkeleton from '@components/WaitingRoom/UserNameInput/UserNameInput.skeleton';
import useWaitingRoom from '@hooks/useWaitingRoom';
import usePublisherContext from '@hooks/usePublisherContext';
import useCameraSwitch from '@hooks/useCameraSwitch';

/**
 * WaitingRoom Component
 *
 * This component renders the waiting room page of the application, including:
 * - A banner containing a company logo, a date-time widget, and a navigable button to a GitHub repo.
 * - A video element showing the user how they'll appear upon joining a room containing controls to:
 *   - Mute their audio input device.
 *   - Disable their video input device.
 *   - Button to configure background replacement (if supported).
 * - Audio input, audio output, and video input device selectors.
 * - A username input field.
 * - A button to run a pre-call network test.
 * - The meeting room name and a button to join the room.
 * @returns {ReactElement} - The waiting room.
 */
const WaitingRoom: FC = () => {
  const { t } = useTranslation();
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

  const { publisher } = usePublisherContext();
  const { cameraError, dismissCameraError } = useCameraSwitch(publisher);

  return (
    <backgroundEffectsDialog$.Provider>
      <precallNetworkTestDialog$.Provider>
        <Box data-testid="waitingRoom">
          <PageLayout>
            <PageLayout.Banner>
              <Banner />
            </PageLayout.Banner>

            <PageLayout.Left>
              <Box
                className={`relative flex flex-col sm:inline-flex h-auto max-w-full sm:h-100 animate-fade-in`}
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
            </PageLayout.Left>

            <PageLayout.Right>
              {isRoomReady && (
                <UsernameInput
                  className={`flex-col sm:inline-flex h-auto sm:h-100 animate-fade-in`}
                  username={username}
                  setUsername={setUsername}
                  roomName={roomName}
                />
              )}

              {!isRoomReady && <UsernameInputSkeleton />}
            </PageLayout.Right>

            <PageLayout.Footer>
              <Footer />
            </PageLayout.Footer>
          </PageLayout>
          {accessStatus !== DEVICE_ACCESS_STATUS.ACCEPTED && (
            <DeviceAccessAlert accessStatus={accessStatus} />
          )}
          <Snackbar
            open={!!cameraError}
            onClose={dismissCameraError}
            autoHideDuration={5000}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            message={cameraError && t(cameraError)}
            action={
              <IconButton size="small" className="text-vera-secondary" onClick={dismissCameraError}>
                <VividIcon name="close-line" customSize={-5} />
              </IconButton>
            }
          />
        </Box>
      </precallNetworkTestDialog$.Provider>
    </backgroundEffectsDialog$.Provider>
  );
};

export default WaitingRoom;
