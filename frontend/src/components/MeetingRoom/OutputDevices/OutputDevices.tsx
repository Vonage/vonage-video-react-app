import { Box, MenuItem, MenuList, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { MouseEvent, ReactElement } from 'react';
import type { AudioOutputDevice } from '@vonage/client-sdk-video';
import { useTranslation } from 'react-i18next';
import useDevices from '../../../hooks/useDevices';
import DropdownSeparator from '../DropdownSeparator';
import useAudioOutputContext from '../../../hooks/useAudioOutputContext';
import { isGetActiveAudioOutputDeviceSupported } from '../../../utils/util';

export type OutputDevicesProps = {
  handleToggle: () => void;
  customLightBlueColor: string;
};

/**
 * OutputDevices Component
 *
 * Displays and switches audio output devices.
 * @param {OutputDevicesProps} props - The props for the component.
 *  @property {() => void} handleToggle - Function to close the menu.
 *  @property {string} customLightBlueColor - The custom color used for the selected device.
 * @returns {ReactElement} - The OutputDevices component.
 */
const OutputDevices = ({
  handleToggle,
  customLightBlueColor,
}: OutputDevicesProps): ReactElement => {
  const { t } = useTranslation();
  const { currentAudioOutputDevice, setAudioOutputDevice } = useAudioOutputContext();
  const {
    allMediaDevices: { audioOutputDevices },
  } = useDevices();
  const defaultOutputDevices = [{ deviceId: 'default', label: t('devices.audio.defaultLabel') }];

  const isAudioOutputSupported = isGetActiveAudioOutputDeviceSupported();

  const availableDevices = isAudioOutputSupported ? audioOutputDevices : defaultOutputDevices;

  const handleChangeAudioOutput = async (event: MouseEvent<HTMLLIElement>) => {
    const menuItem = event.target as HTMLLIElement;
    handleToggle();

    if (isAudioOutputSupported) {
      const deviceId = availableDevices?.find((device: AudioOutputDevice) => {
        return device.label === menuItem.textContent;
      })?.deviceId;

      if (deviceId) {
        await setAudioOutputDevice(deviceId);
      }
    }
  };

  return (
    <>
      <DropdownSeparator />
      <Box
        sx={{
          display: 'flex',
          ml: 2,
          mt: 2,
          mb: 0.5,
        }}
      >
        <VolumeUpIcon sx={{ fontSize: 24, mr: 2 }} />
        <Typography data-testid="output-device-title">
          {t('devices.audio.speakers.full')}
        </Typography>
      </Box>
      <MenuList data-testid="output-devices">
        {availableDevices?.map((device: AudioOutputDevice) => {
          // If audio output device selection is not supported we show the default device as selected
          const isSelected =
            device.deviceId === currentAudioOutputDevice || availableDevices.length === 1;
          return (
            <MenuItem
              key={device.deviceId}
              selected={isSelected}
              onClick={handleChangeAudioOutput}
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
                  <CheckIcon sx={{ color: 'rgb(138, 180, 248)', fontSize: 24, mr: 2 }} />
                ) : (
                  <Box sx={{ width: 40 }} /> // Placeholder when CheckIcon is not displayed
                )}
                <Typography noWrap>{device.label}</Typography>
              </Box>
            </MenuItem>
          );
        })}
      </MenuList>
    </>
  );
};

export default OutputDevices;
