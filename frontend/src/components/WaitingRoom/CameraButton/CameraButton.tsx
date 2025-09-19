import { Box, Tooltip } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import usePreviewPublisherContext from '../../../hooks/usePreviewPublisherContext';
import VideoContainerButton from '../VideoContainerButton';
import useBackgroundPublisherContext from '../../../hooks/useBackgroundPublisherContext';

/**
 * CameraButton Component
 *
 * Displays an overlay button to handle toggling video on and off for the preview publisher.
 * @returns {ReactElement} - The CameraButton component.
 */
const CameraButton = (): ReactElement => {
  const { t } = useTranslation();
  const { isVideoEnabled, toggleVideo } = usePreviewPublisherContext();
  const { toggleVideo: toggleBackgroundVideoPublisher } = useBackgroundPublisherContext();
  const title = isVideoEnabled
    ? t('devices.video.camera.state.off')
    : t('devices.video.camera.state.on');

  const handleToggleVideo = () => {
    toggleVideo();
    toggleBackgroundVideoPublisher();
  };

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
        border: isVideoEnabled ? '1px solid white' : '1px solid rgb(234, 67, 53)',
        overflow: 'hidden',
      }}
    >
      <Tooltip title={title} aria-label={t('devices.video.camera.ariaLabel')}>
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
  );
};

export default CameraButton;
