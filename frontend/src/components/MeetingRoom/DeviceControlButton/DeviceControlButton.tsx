import Mic from '@mui/icons-material/MicNone';
import { IconButton } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import Tooltip from '@mui/material/Tooltip';
import ButtonGroup from '@mui/material/ButtonGroup';
import { MicOff, ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { useState, useRef, useCallback, ReactElement } from 'react';
import MutedAlert from '../../MutedAlert';
import usePublisherContext from '../../../hooks/usePublisherContext';
import DeviceSettingsMenu from '../DeviceSettingsMenu';

export type DeviceControlButtonProps = {
  deviceType: 'audio' | 'video';
};

/**
 * DeviceControlButton Component
 *
 * This component displays a current status of audio/video device (camera/microphone enabled/disabled)
 * and shows a dropdown that displays available audio/video devices.
 * @param {DeviceControlButtonProps} props - the props for the component.
 *  @property {boolean} deviceType - (optional) indicates the type of the device to control.
 * @returns {ReactElement} The DeviceControlButton component.
 */
const DeviceControlButton = ({ deviceType }: DeviceControlButtonProps): ReactElement => {
  const { isVideoEnabled, toggleAudio, toggleVideo, isAudioEnabled } = usePublisherContext();
  const isAudio = deviceType === 'audio';
  const [open, setOpen] = useState<boolean>(false);
  const anchorRef = useRef<HTMLInputElement | null>(null);
  const audioTitle = isAudioEnabled ? 'Disable microphone' : 'Enable microphone';
  const videoTitle = isVideoEnabled ? 'Disable video' : 'Enable video';

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = useCallback((event: MouseEvent | TouchEvent) => {
    if (anchorRef?.current?.contains(event.target as Node)) {
      return;
    }
    setOpen(false);
  }, []);

  const renderControlIcon = () => {
    if (isAudio) {
      if (isAudioEnabled) {
        return <Mic className="text-white" />;
      }
      return <MicOff data-testid="MicOffToolbar" className="text-red-600" />;
    }

    if (isVideoEnabled) {
      return <VideocamIcon className="text-white" />;
    }
    return <VideocamOffIcon className="text-red-500" />;
  };

  return (
    <>
      {isAudio && <MutedAlert />}
      <ButtonGroup
        className="mr-3 mt-1 bg-notVeryGray-55"
        disableElevation
        sx={{ borderRadius: '30px' }}
        variant="contained"
        ref={anchorRef}
        aria-label="split button"
      >
        <IconButton
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label={isAudio ? 'audio devices dropdown' : 'video devices dropdown'}
          aria-haspopup="menu"
          onClick={handleToggle}
          className="size-12"
          data-testid={isAudio ? 'audio-dropdown-button' : 'video-dropdown-button'}
        >
          {open ? (
            <ArrowDropDown sx={{ color: 'rgb(138, 180, 248)' }} />
          ) : (
            <ArrowDropUp className="text-gray-400" />
          )}
        </IconButton>
        <Tooltip title={isAudio ? audioTitle : videoTitle} aria-label="device settings">
          <IconButton
            onClick={isAudio ? toggleAudio : toggleVideo}
            edge="start"
            aria-label={isAudio ? 'microphone' : 'camera'}
            size="small"
            className="m-[3px] size-[50px] rounded-full shadow-md"
          >
            {renderControlIcon()}
          </IconButton>
        </Tooltip>
      </ButtonGroup>
      <DeviceSettingsMenu
        deviceType={deviceType}
        handleToggle={handleToggle}
        anchorRef={anchorRef}
        isOpen={open}
        handleClose={handleClose}
        setIsOpen={setOpen}
      />
    </>
  );
};

export default DeviceControlButton;
