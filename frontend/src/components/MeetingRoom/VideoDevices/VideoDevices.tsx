import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import useTheme from '@ui/theme';
import { Box, MenuList, MenuItem, Tooltip, BoxProps } from '@mui/material';
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
  const theme = useTheme();

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
          sx={{
            display: 'flex',
            ml: 2,
            mt: 1,
            mb: 0.5,
            color: theme.colors.tertiary,
          }}
          className={className}
          {...boxProps}
        >
          <VividIcon name="video-line" customSize={-5} />
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
                sx={{
                  backgroundColor: 'transparent',
                  '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    color: theme.colors.onBackground,
                  },
                  '&:hover': {
                    backgroundColor: theme.colors.background,
                  },
                }}
              >
                <Box
                  key={`${option.deviceId}-video-device`}
                  sx={{
                    color: isSelected ? theme.colors.textPrimary : theme.colors.textSecondary,
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
                        sx={{
                          color: isSelected ? theme.colors.textPrimary : theme.colors.textSecondary,
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
