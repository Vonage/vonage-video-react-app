import { useState, useEffect, MouseEvent, ReactElement, TouchEvent } from 'react';
import Box from '@ui/Box';
import FlexLayout from '@ui/FlexLayout';
import Banner from '@components/Banner';
import Footer from '@components/Footer/Footer';
import usePreviewPublisherContext from '../../hooks/usePreviewPublisherContext';
import ControlPanel from '../../components/WaitingRoom/ControlPanel';
import VideoContainer from '../../components/WaitingRoom/VideoContainer';
import UsernameInput from '../../components/WaitingRoom/UserNameInput';
import { DEVICE_ACCESS_STATUS } from '../../utils/constants';
import DeviceAccessAlert from '../../components/DeviceAccessAlert';
import { getStorageItem, STORAGE_KEYS } from '../../utils/storage';
import useIsSmallViewport from '../../hooks/useIsSmallViewport';
import useBackgroundPublisherContext from '../../hooks/useBackgroundPublisherContext';

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
 * - The meeting room name and a button to join the room.
 * @returns {ReactElement} - The waiting room.
 */
const WaitingRoom = (): ReactElement => {
  const { initLocalPublisher, publisher, accessStatus, destroyPublisher } =
    usePreviewPublisherContext();

  const { initBackgroundLocalPublisher, publisher: backgroundPublisher } =
    useBackgroundPublisherContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openAudioInput, setOpenAudioInput] = useState<boolean>(false);
  const [openVideoInput, setOpenVideoInput] = useState<boolean>(false);
  const [openAudioOutput, setOpenAudioOutput] = useState<boolean>(false);
  const [username, setUsername] = useState(getStorageItem(STORAGE_KEYS.USERNAME) ?? '');
  const isSmallViewport = useIsSmallViewport();

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
    <Box data-testid="waitingRoom">
      <FlexLayout>
        <FlexLayout.Banner>
          <Banner />
        </FlexLayout.Banner>
        <FlexLayout.Left>
          <div
            className={`max-w-full flex-col ${isSmallViewport ? '' : 'h-[394px]'} sm: inline-flex`}
          >
            <VideoContainer username={username} />
            {accessStatus === DEVICE_ACCESS_STATUS.ACCEPTED && (
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
          </div>
        </FlexLayout.Left>
        <FlexLayout.Right>
          <UsernameInput username={username} setUsername={setUsername} />
        </FlexLayout.Right>
        <FlexLayout.Footer>
          <Footer />
        </FlexLayout.Footer>
      </FlexLayout>
      {accessStatus !== DEVICE_ACCESS_STATUS.ACCEPTED && (
        <DeviceAccessAlert accessStatus={accessStatus} />
      )}
    </Box>
  );
};

export default WaitingRoom;
