import { useState, useEffect, MouseEvent, ReactElement } from 'react';
import { Box, MenuItem, MenuList, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import VideocamIcon from '@mui/icons-material/Videocam';
import { Device } from '@vonage/client-sdk-video';
import { useTranslation } from 'react-i18next';
import useDevices from '../../../hooks/useDevices';
import usePublisherContext from '../../../hooks/usePublisherContext';
import { setStorageItem, STORAGE_KEYS } from '../../../utils/storage';

export type VideoDevicesProps = {
  handleToggle: () => void;
  customLightBlueColor: string;
};

/**
 * VideoDevices Component
 *
 * This component is responsible for rendering the list of video output devices (i.e. web cameras).
 * @param {VideoDevicesProps} props - the props for this component.
 *  @property {() => void} handleToggle - the function that handles the toggle of video output device.
 *  @property {string} customLightBlueColor - the custom color used for the toggled icon.
 * @returns {ReactElement} - the video output devices component.
 */
const VideoDevices = ({ handleToggle, customLightBlueColor }: VideoDevicesProps): ReactElement => {
  const { t } = useTranslation();
  const { isPublishing, publisher } = usePublisherContext();
  const { allMediaDevices } = useDevices();
  const [devicesAvailable, setDevicesAvailable] = useState<Device[]>([]);
  const [options, setOptions] = useState<{ deviceId: string; label: string }[]>([]);

  const changeVideoSource = (videoDeviceId: string) => {
    publisher?.setVideoSource(videoDeviceId);
    setStorageItem(STORAGE_KEYS.VIDEO_SOURCE, videoDeviceId);
  };

  useEffect(() => {
    setDevicesAvailable(allMediaDevices.videoInputDevices);
  }, [publisher, allMediaDevices, devicesAvailable, isPublishing]);

  useEffect(() => {
    if (devicesAvailable) {
      const videoDevicesAvailable = devicesAvailable.map((availableDevice: Device) => ({
        deviceId: availableDevice.deviceId,
        label: availableDevice.label,
      }));
      setOptions(videoDevicesAvailable);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devicesAvailable]);

  const handleChangeVideoSource = (event: MouseEvent<HTMLLIElement>) => {
    const menuItem = event.target as HTMLLIElement;
    handleToggle();
    const selectedDevice = options.find((device) => device.label === menuItem.textContent);
    if (selectedDevice) {
      changeVideoSource(selectedDevice.deviceId);
    }
  };

  return (
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
        {options.map((option) => {
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
                  color: customLightBlueColor,
                },
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  mb: 0.5,
                  overflow: 'hidden',
                }}
              >
                {isSelected ? (
                  <CheckIcon sx={{ color: customLightBlueColor, fontSize: 24, mr: 2 }} />
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
  );
};

export default VideoDevices;
