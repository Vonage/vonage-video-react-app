import { Box, Tooltip } from '@mui/material';
import { MicOff } from '@mui/icons-material';
import MicIcon from '@mui/icons-material/Mic';
import { ReactElement } from 'react';
import usePreviewPublisherContext from '../../../hooks/usePreviewPublisherContext';
import VideoContainerButton from '../VideoContainerButton';

/**
 * MicToggleButton Component
 *
 * Toggles the user's microphone (published audio) and updates the icon accordingly.
 * @returns {ReactElement} - The MicToggleButton component.
 */
const MicToggleButton = (): ReactElement => {
  const { isAudioEnabled, toggleAudio } = usePreviewPublisherContext();
  const title = `Turn ${isAudioEnabled ? 'off' : 'on'} microphone`;

  return (
    <Box
      sx={{
        display: 'flex',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        border: isAudioEnabled ? '1px solid white' : '1px solid rgb(234, 67, 53)',
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out',
      }}
    >
      <Tooltip title={title} aria-label="toggle audio">
        <VideoContainerButton
          onClick={toggleAudio}
          isEnabled={isAudioEnabled}
          sx={{
            backgroundColor: !isAudioEnabled ? 'rgb(234, 67, 53)' : '',
            '&:hover': {
              backgroundColor: isAudioEnabled
                ? 'rgba(255, 255, 255, 0.6)'
                : 'rgb(234, 67, 53, 0.8)',
            },
          }}
          icon={
            isAudioEnabled ? (
              <MicIcon sx={{ fontSize: '24px', color: 'white' }} />
            ) : (
              <MicOff sx={{ fontSize: '24px', color: 'white' }} />
            )
          }
        />
      </Tooltip>
    </Box>
  );
};

export default MicToggleButton;
