import { Button, SxProps } from '@mui/material';
import { ReactElement, MouseEvent, TouchEvent } from 'react';
import MicNone from '@mui/icons-material/MicNone';
import VideoCall from '@mui/icons-material/VideoCall';
import Speaker from '@mui/icons-material/Speaker';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from 'react-i18next';
import MenuDevicesWaitingRoom from '../MenuDevices';
import usePreviewPublisherContext from '../../../hooks/usePreviewPublisherContext';
import useDevices from '../../../hooks/useDevices';
import useAudioOutputContext from '../../../hooks/useAudioOutputContext';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';

export type ControlPanelProps = {
  handleAudioInputOpen: (
    event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>
  ) => void;
  handleVideoInputOpen: (
    event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>
  ) => void;
  handleAudioOutputOpen: (
    event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>
  ) => void;
  handleClose: () => void;
  openVideoInput: boolean;
  openAudioInput: boolean;
  openAudioOutput: boolean;
  anchorEl: HTMLElement | null;
};

/**
 * ControlPanel Component
 *
 * Displays drop-down menus to change the user's audio input, audio output, and video input devices.
 * @param {ControlPanelProps} props - The props for the component.
 *  @property {Function} handleAudioInputOpen - Function to open the audio input menu.
 *  @property {Function} handleVideoInputOpen - Function to open the video input menu.
 *  @property {Function} handleAudioOutputOpen - Function to open the audio output menu.
 *  @property {() => void} handleClose - Function to close the menu.
 *  @property {boolean} openVideoInput - Whether the video input menu is open.
 *  @property {boolean} openAudioInput - Whether the audio input menu is open.
 *  @property {boolean} openAudioOutput- Whether the audio output menu is open.
 *  @property {HTMLElement | null} anchorEl - The reference element for the ControlPanel component.
 * @returns {ReactElement} - The ControlPanel component.
 */
const ControlPanel = ({
  handleAudioInputOpen,
  handleVideoInputOpen,
  handleAudioOutputOpen,
  handleClose,
  openVideoInput,
  openAudioInput,
  openAudioOutput,
  anchorEl,
}: ControlPanelProps): ReactElement => {
  const { t } = useTranslation();
  const isSmallViewport = useIsSmallViewport();
  const { allMediaDevices } = useDevices();
  const { localAudioSource, localVideoSource, changeAudioSource, changeVideoSource } =
    usePreviewPublisherContext();
  const { currentAudioOutputDevice, setAudioOutputDevice } = useAudioOutputContext();

  const buttonSx: SxProps = {
    borderRadius: '10px',
    color: 'rgb(95, 99, 104)',
    textTransform: 'none', // ensures that the text is not upper case
    border: 'none',
    boxShadow: 'none',
    whiteSpace: 'nowrap',
    '&:hover': {
      border: 'none',
      boxShadow: 'none',
    },
  };

  return (
    <div className="m-auto my-4 max-w-[100dvw]" data-testid="ControlPanel">
      <div className="flex flex-row justify-evenly min-[400px]:w-[400px]">
        <Button
          sx={buttonSx}
          endIcon={<KeyboardArrowDownIcon />}
          variant="outlined"
          startIcon={<MicNone />}
          aria-controls={openVideoInput ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={openVideoInput ? 'true' : undefined}
          onClick={handleAudioInputOpen}
        >
          {isSmallViewport
            ? t('devices.audio.microphone.short')
            : t('devices.audio.microphone.full')}
        </Button>
        <MenuDevicesWaitingRoom
          devices={allMediaDevices.audioInputDevices}
          open={openAudioInput}
          onClose={handleClose}
          anchorEl={anchorEl}
          localSource={localAudioSource}
          deviceChangeHandler={changeAudioSource}
          deviceType="audioInput"
        />
        <Button
          onClick={handleVideoInputOpen}
          endIcon={<KeyboardArrowDownIcon />}
          sx={buttonSx}
          variant="outlined"
          startIcon={<VideoCall />}
          aria-label={t('devices.video.camera.button.ariaLabel')}
        >
          {t('button.camera')}
        </Button>

        <MenuDevicesWaitingRoom
          devices={allMediaDevices.videoInputDevices}
          open={openVideoInput}
          onClose={handleClose}
          anchorEl={anchorEl}
          localSource={localVideoSource}
          deviceChangeHandler={changeVideoSource}
          deviceType="videoInput"
        />
        <Button
          onClick={handleAudioOutputOpen}
          endIcon={<KeyboardArrowDownIcon />}
          sx={buttonSx}
          variant="outlined"
          startIcon={<Speaker />}
        >
          {t('button.speaker')}
        </Button>
        <MenuDevicesWaitingRoom
          devices={allMediaDevices.audioOutputDevices}
          open={openAudioOutput}
          onClose={handleClose}
          anchorEl={anchorEl}
          localSource={currentAudioOutputDevice}
          deviceChangeHandler={setAudioOutputDevice}
          deviceType="audioOutput"
        />
      </div>
    </div>
  );
};

export default ControlPanel;
