import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, MenuList, MenuItem, Tooltip, BoxProps, Snackbar } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import classNames from 'classnames';
import VividIcon from '@components/VividIcon';
import { useDistinctLabelMediaDevices } from '@ui/hooks';
import mediaDevices$ from '@core/stores/devices';
import usePublisherContext from '@hooks/usePublisherContext';
import useCameraSwitch from '@hooks/useCameraSwitch';
import { env } from '../../../env';

export type VideoDevicesProps = BoxProps & {
  handleToggle: () => void;
};

/**
 * VideoDevices Component
 *
 * This component is responsible for rendering the list of video output devices (i.e. web cameras).
 * @param {VideoDevicesProps} props - the props for this component.
 *  @property {() => void} handleToggle - the function that handles the toggle of video output device.
 * @returns {ReactElement | false} - the video output devices component.
 */
const VideoDevices = ({
  handleToggle,
  className,
  ...boxProps
}: VideoDevicesProps): ReactElement | false => {
  const { t } = useTranslation();
  const { publisher } = usePublisherContext();
  const { switchCamera, cameraError, dismissCameraError } = useCameraSwitch(publisher);

  // Use store's selection as source of truth, not publisher.getVideoSource() which can be stale
  const selectedDeviceId = mediaDevices$.useDeviceId('videoinput');

  const devicesAvailable = useDistinctLabelMediaDevices('videoinput', (devices) =>
    devices.map((device) => ({
      ...device,
      label: device.label ?? t('unknown.device'),
    }))
  );

  const handleChangeVideoSource = async (deviceId: string) => {
    handleToggle();

    if (!publisher) {
      await mediaDevices$.actions.selectDevice('videoinput', deviceId);
      return;
    }
    await switchCamera(deviceId);
  };

  return (
    env.MEETING_ROOM_ALLOW_DEVICE_SELECTION && (
      <>
        <Snackbar
          open={!!cameraError}
          onClose={dismissCameraError}
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          message={cameraError && t(cameraError)}
          action={
            <IconButton size="small" className="text-vera-secondary" onClick={dismissCameraError}>
              <VividIcon name="close-line" customSize={-5} />
            </IconButton>
          }
        />
        <Box
          className={classNames('text-vera-tertiary', className)}
          sx={{
            display: 'flex',
            ml: 2,
            mt: 1,
            mb: 0.5,
          }}
          {...boxProps}
        >
          <VividIcon
            name="video-line"
            customSize={-5}
            style={{ color: 'var(--vera-text-secondary)' }}
          />
          <p className="text-vera-body-extended ml-4">{t('devices.video.camera.full')}</p>
        </Box>
        <MenuList id="split-button-menu">
          {devicesAvailable.map((option) => {
            const isSelected = option.deviceId === selectedDeviceId;
            return (
              <MenuItem
                key={option.deviceId}
                selected={isSelected}
                onClick={() => handleChangeVideoSource(option.deviceId)}
                className="[&.Mui-selected]:bg-transparent [&.Mui-selected]:text-vera-on-background hover:bg-vera-background"
              >
                <Box
                  key={`${option.deviceId}-video-device`}
                  className={classNames({
                    'text-vera-text-primary': isSelected,
                    'text-vera-text-secondary': !isSelected,
                  })}
                  sx={{
                    display: 'flex',
                    mb: 0.5,
                    overflow: 'hidden',
                  }}
                >
                  {isSelected ? (
                    <Box key={'video-devices-check'} sx={{ mr: 2.5 }}>
                      <VividIcon
                        name="check-line"
                        customSize={-6}
                        style={{
                          color: `${
                            isSelected ? 'var(--vera-text-primary)' : 'var(--vera-text-secondary)'
                          } !important`,
                        }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ minWidth: 36 }} /> // Placeholder when CheckIcon is not displayed
                  )}
                  <Tooltip title={option.label} placement="right" arrow>
                    <span className="text-vera-body-extended truncate">{option.label}</span>
                  </Tooltip>
                </Box>
              </MenuItem>
            );
          })}
        </MenuList>
      </>
    )
  );
};

export default VideoDevices;
