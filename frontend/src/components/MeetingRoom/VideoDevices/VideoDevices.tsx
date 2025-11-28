import { MouseEvent, ReactElement } from 'react';
import { Box, MenuItem, MenuList, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import VideocamIcon from '@mui/icons-material/Videocam';
import { useTranslation } from 'react-i18next';
import useAppConfig from '@Context/AppConfig/hooks/useAppConfig';
import useCustomTheme from '@Context/Theme';
import usePublisherContext from '../../../hooks/usePublisherContext';
import { setStorageItem, STORAGE_KEYS } from '../../../utils/storage';
import useVideoInputDevices from '@Context/Device/hooks/useVideoInputDevices';
import cleanAndDedupeDeviceLabels from '@utils/cleanAndDedupeDeviceLabels';

export type VideoDevicesProps = {
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
const VideoDevices = ({ handleToggle }: VideoDevicesProps): ReactElement | false => {
  const { t } = useTranslation();
  const theme = useCustomTheme();
  const { publisher } = usePublisherContext();

  const allowDeviceSelection = useAppConfig(
    ({ meetingRoomSettings }) => meetingRoomSettings.allowDeviceSelection
  );

  const changeVideoSource = (videoDeviceId: string) => {
    publisher?.setVideoSource(videoDeviceId);
    setStorageItem(STORAGE_KEYS.VIDEO_SOURCE, videoDeviceId);
  };

  const videoInputDevices = useVideoInputDevices((videoInputDevices) =>
    cleanAndDedupeDeviceLabels(videoInputDevices).map((device) => ({
      deviceId: device.deviceId as string,
      label: device.label || t('unknown.device'),
    }))
  );

  const handleChangeVideoSource = (event: MouseEvent<HTMLLIElement>) => {
    const menuItem = event.target as HTMLLIElement;
    handleToggle();
    const selectedDevice = videoInputDevices.find(
      (device) => device.label === menuItem.textContent
    );
    if (selectedDevice) {
      changeVideoSource(selectedDevice.deviceId);
    }
  };

  return (
    allowDeviceSelection && (
      <>
        <Box
          sx={{
            display: 'flex',
            ml: 2,
            mt: 1,
            mb: 0.5,
          }}
        >
          <VideocamIcon sx={{ fontSize: 24, mr: 2 }} />
          <Typography>{t('devices.video.camera.full')}</Typography>
        </Box>
        <MenuList id="split-button-menu">
          {videoInputDevices.map((option) => {
            const isSelected = option.deviceId === publisher?.getVideoSource().deviceId;
            return (
              <MenuItem
                key={option.deviceId}
                selected={isSelected}
                onClick={(event) => handleChangeVideoSource(event)}
                sx={{
                  backgroundColor: 'transparent',
                  '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    color: theme.colors.background,
                  },
                  '&:hover': {
                    backgroundColor: theme.colors.primaryHover,
                  },
                }}
              >
                <Box
                  key={`${option.deviceId}-video-device`}
                  sx={{
                    display: 'flex',
                    mb: 0.5,
                    overflow: 'hidden',
                  }}
                >
                  {isSelected ? (
                    <CheckIcon
                      sx={{
                        color: theme.colors.background,
                        fontSize: 24,
                        mr: 2,
                      }}
                    />
                  ) : (
                    <Box sx={{ width: 40 }} /> // Placeholder when CheckIcon is not displayed
                  )}
                  <Typography noWrap>{option.label}</Typography>
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
