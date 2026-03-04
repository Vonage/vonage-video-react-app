import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import useBackgroundPublisherContext from '@hooks/useBackgroundPublisherContext';
import { VIDEO_CONTAINER_BUTTON_SIZE_WR } from '@utils/constants';
import useTheme from '@ui/theme';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import VividIcon from '@components/VividIcon';
import VideoContainerButton from '../VideoContainerButton';
import { env } from '../../../env';

/**
 * CameraButton Component
 *
 * Displays an overlay button to handle toggling video on and off for the preview publisher.
 * @returns {ReactElement | false} - The CameraButton component.
 */
const CameraButton = (): ReactElement | false => {
  const { t } = useTranslation();
  const { isVideoEnabled, toggleVideo } = usePreviewPublisherContext();
  const { toggleVideo: toggleBackgroundVideoPublisher } = useBackgroundPublisherContext();
  const theme = useTheme();

  const title = isVideoEnabled
    ? t('devices.video.camera.state.off')
    : t('devices.video.camera.state.on');

  const handleToggleVideo = () => {
    toggleVideo();
    toggleBackgroundVideoPublisher();
  };

  return (
    env.ALLOW_CAMERA_CONTROL && (
      <Box
        data-testid="camera-button-wrapper"
        sx={{
          display: 'flex',
          position: 'relative',
          justifyContent: 'center',
          alignItems: 'center',
          width: `${VIDEO_CONTAINER_BUTTON_SIZE_WR}px`,
          height: `${VIDEO_CONTAINER_BUTTON_SIZE_WR}px`,
          borderRadius: '50%',
          border: isVideoEnabled ? `1px solid ${theme.colors.onSecondary}` : 'none',
          overflow: 'hidden',
        }}
      >
        <Tooltip arrow title={title} aria-label={t('devices.video.camera.ariaLabel')}>
          <VideoContainerButton
            onClick={handleToggleVideo}
            sx={{
              backgroundColor: isVideoEnabled ? '' : theme.colors.alertBackground,
              '&:hover': {
                backgroundColor: isVideoEnabled
                  ? `${theme.colors.onSecondary}99`
                  : `${theme.colors.alertBackgroundHover}`,
              },
            }}
            icon={
              isVideoEnabled ? (
                <VividIcon
                  name="video-line"
                  customSize={-5}
                  sx={{ color: theme.colors.onSecondary }}
                />
              ) : (
                <VividIcon
                  name="video-off-line"
                  customSize={-5}
                  sx={{ color: theme.colors.alertText }}
                />
              )
            }
          />
        </Tooltip>
      </Box>
    )
  );
};

export default CameraButton;
