import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import useBackgroundPublisherContext from '@hooks/useBackgroundPublisherContext';
import { VIDEO_CONTAINER_BUTTON_SIZE_WR } from '@utils/constants';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import VividIcon from '@ui/components/VividIcon';
import VideoContainerButton from '../VideoContainerButton';
import DevicePermissionBadge from '../../DevicePermissionBadge';
import { env } from '../../../env';

/**
 * CameraButton Component
 *
 * Displays an overlay button to handle toggling video on and off for the preview publisher.
 * When the browser has blocked the camera the button shows the video-off icon plus a warning
 * badge and a "blocked" tooltip (Google Meet style), distinguishing it from a user-disabled camera.
 * @returns {ReactElement | false} - The CameraButton component.
 */
const CameraButton = (): ReactElement | false => {
  const { t } = useTranslation();
  const { isVideoEnabled, toggleVideo, deniedDevices } = usePreviewPublisherContext();
  const { toggleVideo: toggleBackgroundVideoPublisher } = useBackgroundPublisherContext();

  const isCameraBlocked = deniedDevices.camera;
  // A blocked camera has no track, so present it as off regardless of the user's toggle intent.
  const showOff = isCameraBlocked || !isVideoEnabled;

  const title = (() => {
    if (isCameraBlocked) return t('devices.video.camera.state.blocked');
    return isVideoEnabled
      ? t('devices.video.camera.state.off')
      : t('devices.video.camera.state.on');
  })();

  const handleToggleVideo = () => {
    toggleVideo();
    toggleBackgroundVideoPublisher();
  };

  return (
    env.ALLOW_CAMERA_CONTROL && (
      <span className="relative inline-flex">
        <Box
          data-testid="camera-button-wrapper"
          className={classNames({
            'border border-vera-on-secondary': !showOff,
            'border-none': showOff,
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
                  'bg-vera-alert-background! hover:bg-vera-alert-background-hover!': showOff,
                }
              )}
              sx={{
                '&:hover': {
                  backgroundColor: showOff
                    ? undefined
                    : 'color-mix(in srgb, var(--vera-on-secondary) 60%, transparent)',
                },
              }}
              icon={
                showOff ? (
                  <VividIcon
                    name="video-off-line"
                    customSize={-5}
                    style={{ color: 'var(--vera-alert-text)' }}
                  />
                ) : (
                  <VividIcon
                    name="video-line"
                    customSize={-5}
                    style={{ color: 'var(--vera-on-secondary)' }}
                  />
                )
              }
            />
          </Tooltip>
        </Box>
        {isCameraBlocked && <DevicePermissionBadge />}
      </span>
    )
  );
};

export default CameraButton;
