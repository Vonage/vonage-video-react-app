import React, {
  useState,
  useEffect,
  MouseEvent,
  TouchEvent,
  ComponentProps,
  useEffectEvent,
} from 'react';
import Box from '@ui/Box';
import GridLayout from '@ui/FlexLayout';
import classNames from 'classnames';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import ControlPanel from '@components/WaitingRoom/ControlPanel';
import VideoContainer from '@components/WaitingRoom/VideoContainer';
import UsernameInput from '@components/WaitingRoom/UserNameInput';
import Banner from '@components/Banner';
import { getStorageItem, STORAGE_KEYS } from '@utils/storage';
import useIsSmallViewport from '@hooks/useIsSmallViewport';
import useBackgroundPublisherContext from '@hooks/useBackgroundPublisherContext';
import useSuspenseUntilAppConfigReady from '@Context/AppConfig/hooks/useSuspenseUntilAppConfigReady';
import useIsCameraControlAllowed from '@Context/AppConfig/hooks/useIsCameraControlAllowed';
import useIsMicrophoneControlAllowed from '@Context/AppConfig/hooks/useIsMicrophoneControlAllowed';

type WaitingRoomProps = ComponentProps<'div'>;

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
 * @param root0
 * @param root0.className
 * @returns {ReactElement} - The waiting room.
 */
const WaitingRoom: React.FC<WaitingRoomProps> = ({ className, ...props }) => {
  useSuspenseUntilAppConfigReady();

  const isCameraAllowed = useIsCameraControlAllowed();
  const isMicrophoneAllowed = useIsMicrophoneControlAllowed();

  const { initializeLocalPublisher, isAudioEnabled, isVideoEnabled } = usePreviewPublisherContext();

  const { initBackgroundLocalPublisher, publisher: backgroundPublisher } =
    useBackgroundPublisherContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openAudioInput, setOpenAudioInput] = useState<boolean>(false);
  const [openVideoInput, setOpenVideoInput] = useState<boolean>(false);
  const [openAudioOutput, setOpenAudioOutput] = useState<boolean>(false);
  const [username, setUsername] = useState(getStorageItem(STORAGE_KEYS.USERNAME) ?? '');
  const isSmallViewport = useIsSmallViewport();

  const shouldInitializeAudioSource = isMicrophoneAllowed && isAudioEnabled;
  const shouldInitializeVideoSource = isCameraAllowed && isVideoEnabled;

  const tryInitializeLocalPublisher = useEffectEvent(() => {
    const shouldInitializeAudioSource = isMicrophoneAllowed && isAudioEnabled;
    const shouldInitializeVideoSource = isCameraAllowed && isVideoEnabled;
    const shouldInitializePublisher = shouldInitializeAudioSource || shouldInitializeVideoSource;

    if (!shouldInitializePublisher) return;

    void initializeLocalPublisher();
  });

  const tryInitBackgroundLocalPublisher = useEffectEvent(() => {
    const shouldInitialize =
      !backgroundPublisher && (shouldInitializeAudioSource || shouldInitializeVideoSource);

    if (!shouldInitialize) return;

    void initBackgroundLocalPublisher();
  });

  useEffect(() => {
    void tryInitBackgroundLocalPublisher();
    tryInitializeLocalPublisher();
  }, []);

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
    <Box data-testid="waitingRoom" className={classNames(className)} {...props}>
      <GridLayout>
        <GridLayout.Banner>
          <Banner />
        </GridLayout.Banner>
        <GridLayout.Left>
          <div
            className={`max-w-full flex-col ${isSmallViewport ? '' : 'h-[394px]'} sm: inline-flex`}
          >
            <VideoContainer username={username} />
            {
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
            }
          </div>
        </GridLayout.Left>
        <GridLayout.Right>
          <UsernameInput username={username} setUsername={setUsername} />
        </GridLayout.Right>
      </GridLayout>
    </Box>
  );
};

export default WaitingRoom;
