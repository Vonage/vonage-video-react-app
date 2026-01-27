import { useState, useEffect, MouseEvent, TouchEvent, FC } from 'react';
import Box from '@ui/Box';
import PageLayout from '@ui/PageLayout';
import Banner from '@components/Banner';
import Footer from '@components/Footer/Footer';
import usePreviewPublisherContext from '../../hooks/usePreviewPublisherContext';
import ControlPanel from '../../components/WaitingRoom/ControlPanel';
import VideoContainer from '../../components/WaitingRoom/VideoContainer';
import UsernameInput from '../../components/WaitingRoom/UserNameInput';
import { DEVICE_ACCESS_STATUS } from '../../utils/constants';
import DeviceAccessAlert from '../../components/DeviceAccessAlert';
import { getStorageItem, STORAGE_KEYS } from '../../utils/storage';
import useBackgroundPublisherContext from '../../hooks/useBackgroundPublisherContext';
import backgroundEffectsDialog$ from '../../Context/BackgroundEffectsDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import appConfig$ from '@stores/appConfig';
import { BoxProps } from '@mui/material';

type WaitingRoomProps = Omit<BoxProps, 'sx'>;

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
const WaitingRoom: FC<WaitingRoomProps> = () => {
  const { initLocalPublisher, publisher, accessStatus, destroyPublisher } =
    usePreviewPublisherContext();

  const { initBackgroundLocalPublisher, publisher: backgroundPublisher } =
    useBackgroundPublisherContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openAudioInput, setOpenAudioInput] = useState<boolean>(false);
  const [openVideoInput, setOpenVideoInput] = useState<boolean>(false);
  const [openAudioOutput, setOpenAudioOutput] = useState<boolean>(false);
  const [username, setUsername] = useState(getStorageItem(STORAGE_KEYS.USERNAME) ?? '');

  const allowDeviceSelection = appConfig$.use.select(
    ({ waitingRoomSettings }) => waitingRoomSettings.allowDeviceSelection
  );

  useEffect(() => {
    if (!publisher) {
      initLocalPublisher();
    }

    return () => {
      // Ensure we destroy the publisher and release any media devices.
      if (publisher) {
        destroyPublisher();
      }
    };
  }, [initLocalPublisher, publisher, destroyPublisher]);

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

  return (
    <backgroundEffectsDialog$.Provider>
      <precallNetworkTestDialog$.Provider>
        <Box data-testid="waitingRoom">
          <PageLayout>
            <PageLayout.Banner>
              <Banner />
            </PageLayout.Banner>

            <PageLayout.Left>
              <Box className="flex-col sm:inline-flex h-auto sm:h-[400px] animate-fade-in">
                <VideoContainer username={username} />
                {allowDeviceSelection && accessStatus === DEVICE_ACCESS_STATUS.ACCEPTED && (
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
                )}
              </Box>
            </PageLayout.Left>

            <PageLayout.Right>
              <UsernameInput
                className="flex-col sm:inline-flex h-auto sm:h-[400px] animate-fade-in"
                username={username}
                setUsername={setUsername}
              />
            </PageLayout.Right>

            <PageLayout.Footer>
              <Footer />
            </PageLayout.Footer>
          </PageLayout>
          {accessStatus !== DEVICE_ACCESS_STATUS.ACCEPTED && (
            <DeviceAccessAlert accessStatus={accessStatus} />
          )}
        </Box>
      </precallNetworkTestDialog$.Provider>
    </backgroundEffectsDialog$.Provider>
  );
};

export default WaitingRoom;
