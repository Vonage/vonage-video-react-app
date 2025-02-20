import Mic from '@mui/icons-material/MicNone';
import { IconButton } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import ButtonGroup from '@mui/material/ButtonGroup';
import { MicOff, ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { useState, useRef, useCallback, ReactElement } from 'react';
import MutedAlert from '../../MutedAlert';
import usePublisherContext from '../../../hooks/usePublisherContext';
import AudioInputOutputDevices from '../AudioInputOutputDevices';

/**
 * AudioControlButton Component
 *
 * This component displays the current status of microphone (muted/unmuted)
 * and shows a dropdown that displays available audio devices (microphones, speakers).
 * @returns {ReactElement} The AudioControlButton component.
 */
const AudioControlButton = (): ReactElement => {
  const { isAudioEnabled, toggleAudio } = usePublisherContext();
  const [open, setOpen] = useState<boolean>(false);
  const anchorRef = useRef<HTMLInputElement>(null);
  const title = isAudioEnabled ? 'Disable microphone' : 'Enable microphone';

  const handleClose = useCallback((event: MouseEvent | TouchEvent) => {
    if (anchorRef?.current?.contains(event.target as Node)) {
      return;
    }
    setOpen(false);
  }, []);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  return (
    <div className="hidden xs:inline">
      <MutedAlert anchorRef={anchorRef} />
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
          aria-label="audio devices dropdown"
          aria-haspopup="menu"
          onClick={handleToggle}
          className="size-12"
        >
          {open ? (
            <ArrowDropDown sx={{ color: 'rgb(138, 180, 248)' }} />
          ) : (
            <ArrowDropUp className="text-gray-400" />
          )}
        </IconButton>
        <Tooltip title={title} aria-label="add">
          <IconButton
            onClick={toggleAudio}
            edge="start"
            aria-label="microphone"
            size="small"
            className="m-[3px] size-[50px] rounded-full shadow-md"
          >
            {isAudioEnabled ? (
              <Mic className="text-white" />
            ) : (
              <MicOff data-testid="MicOffToolbar" className="text-red-600" />
            )}
          </IconButton>
        </Tooltip>
      </ButtonGroup>
      <AudioInputOutputDevices
        handleToggle={handleToggle}
        anchorRef={anchorRef}
        isOpen={open}
        handleClose={handleClose}
      />
    </div>
  );
};

export default AudioControlButton;
