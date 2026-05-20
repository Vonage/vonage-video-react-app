import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import useBackgroundPublisherContext from '@hooks/useBackgroundPublisherContext';
import { VIDEO_CONTAINER_BUTTON_SIZE_WR } from '@utils/constants';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import VividIcon from '@ui/VividIcon';
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
        className={classNames({
          'border border-vera-on-secondary': isVideoEnabled,
          'border-none': !isVideoEnabled,
        })}
        sx={{
          display: 'flex',
          position: 'relative',
          justifyContent: 'center',
          alignItems: 'center',
          width: `${VIDEO_CONTAINER_BUTTON_SIZE_WR}px`,
          height: `${VIDEO_CONTAINER_BUTTON_SIZE_WR}px`,
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      >
        <Tooltip arrow title={title} aria-label={t('devices.video.camera.ariaLabel')}>
          <VideoContainerButton
            onClick={handleToggleVideo}
            className={classNames(
              'hover:bg-[color-mix(in_srgb,var(--vera-on-secondary)_60%,transparent)]!',
              {
                'bg-vera-alert-background! hover:bg-vera-alert-background-hover!': !isVideoEnabled,
              }
            )}
            sx={{
              '&:hover': {
                backgroundColor: isVideoEnabled
                  ? 'color-mix(in srgb, var(--vera-on-secondary) 60%, transparent)'
                  : undefined,
              },
            }}
            icon={
              isVideoEnabled ? (
                <VividIcon
                  name="video-line"
                  customSize={-5}
                  style={{ color: 'var(--vera-on-secondary)' }}
                />
              ) : (
                <VividIcon
                  name="video-off-line"
                  customSize={-5}
                  style={{ color: 'var(--vera-alert-text)' }}
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
