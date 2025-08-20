import { Box, Tooltip } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { ReactElement } from 'react';
import usePreviewPublisherContext from '../../../hooks/usePreviewPublisherContext';
import VideoContainerButton from '../VideoContainerButton';
import useBackgroundPublisherContext from '../../../hooks/useBackgroundPublisherContext';
import useConfigContext from '../../../hooks/useConfigContext';

/**
 * CameraButton Component
 *
 * Displays an overlay button to handle toggling video on and off for the preview publisher.
 * @returns {ReactElement | false} - The CameraButton component.
 */
const CameraButton = (): ReactElement | false => {
  const { isVideoEnabled, toggleVideo } = usePreviewPublisherContext();
  const { toggleVideo: toggleBackgroundVideoPublisher } = useBackgroundPublisherContext();
  const config = useConfigContext();
  const title = `Turn ${isVideoEnabled ? 'off' : 'on'} camera`;
  const canEnableOrDisableCamera = config.videoSettings.enableDisableCapableCamera;

  const handleToggleVideo = () => {
    toggleVideo();
    toggleBackgroundVideoPublisher();
  };

  return (
    canEnableOrDisableCamera && (
      <Box
        sx={{
          display: 'flex',
          position: 'relative',
          justifyContent: 'center',
          alignItems: 'center',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: isVideoEnabled ? '1px solid white' : '1px solid rgb(234, 67, 53)',
          overflow: 'hidden',
        }}
      >
        <Tooltip title={title} aria-label="toggle video">
          <VideoContainerButton
            onClick={handleToggleVideo}
            sx={{
              backgroundColor: !isVideoEnabled ? 'rgb(234, 67, 53)' : '',
              '&:hover': {
                backgroundColor: isVideoEnabled
                  ? 'rgba(255, 255, 255, 0.6)'
                  : 'rgb(234, 67, 53, 0.8)',
              },
            }}
            icon={
              isVideoEnabled ? (
                <VideocamIcon sx={{ fontSize: '24px', color: 'white' }} />
              ) : (
                <VideocamOffIcon sx={{ fontSize: '24px', color: 'white' }} />
              )
            }
          />
        </Tooltip>
      </Box>
    )
  );
};

export default CameraButton;
