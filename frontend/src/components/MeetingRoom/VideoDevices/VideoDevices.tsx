import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, MenuList, MenuItem, Tooltip, BoxProps } from '@mui/material';
import classNames from 'classnames';
import VividIcon from '@components/VividIcon';
import { useDistinctLabelMediaDevices } from '@ui/hooks';
import mediaDevices$ from '@core/stores/devices';
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

  // Use store's selection as source of truth, not publisher.getVideoSource() which can be stale
  const selectedDeviceId = mediaDevices$.useDeviceId('videoinput');

  const devicesAvailable = useDistinctLabelMediaDevices('videoinput', (devices) =>
    devices.map((device) => ({
      ...device,
      label: device.label ?? t('unknown.device'),
    }))
  );

  const handleChangeVideoSource = (deviceId: string) => {
    handleToggle();
    void mediaDevices$.actions.selectDevice('videoinput', deviceId);
  };

  return (
    env.MEETING_ROOM_ALLOW_DEVICE_SELECTION && (
      <>
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
