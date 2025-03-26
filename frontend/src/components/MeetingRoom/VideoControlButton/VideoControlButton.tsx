import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { IconButton } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import ButtonGroup from '@mui/material/ButtonGroup';
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { useState, useRef, ReactElement } from 'react';
import usePublisherContext from '../../../hooks/usePublisherContext';
import VideoSettingsMenu from '../VideoSettingsMenu';

/**
 * VideoControlButton Component
 *
 * This component displays a current status of video device (camera enabled/disabled)
 * and shows a dropdown that displays available video devices.
 * @returns {ReactElement} The VideoControlButton component.
 */
const VideoControlButton = (): ReactElement => {
  const { isVideoEnabled, toggleVideo } = usePublisherContext();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLInputElement>(null);
  const title = isVideoEnabled ? 'Disable video' : 'Enable video';

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (event.target instanceof HTMLElement && anchorRef.current?.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  return (
    <>
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
          aria-label="video devices dropdown"
          aria-haspopup="menu"
          title="Open"
          onClick={handleToggle}
          className="size-12"
          data-testid="video-dropdown-button"
        >
          {open ? (
            <ArrowDropDown sx={{ color: 'rgb(138, 180, 248)' }} />
          ) : (
            <ArrowDropUp className="text-gray-400" />
          )}
        </IconButton>
        <Tooltip title={title} aria-label="add">
          <IconButton
            onClick={toggleVideo}
            edge="start"
            aria-label="videoCamera"
            size="small"
            className="m-[3px] size-[50px] rounded-full shadow-md"
          >
            {isVideoEnabled ? (
              <VideocamIcon className="text-white" />
            ) : (
              <VideocamOffIcon className="text-red-500" />
            )}
          </IconButton>
        </Tooltip>
      </ButtonGroup>

      <VideoSettingsMenu
        handleToggle={handleToggle}
        anchorRef={anchorRef}
        isOpen={open}
        handleClose={handleClose}
        setIsOpen={setOpen}
      />
    </>
  );
};

export default VideoControlButton;
