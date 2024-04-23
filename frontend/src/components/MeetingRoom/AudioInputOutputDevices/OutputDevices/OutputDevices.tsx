import { Box, MenuItem, MenuList, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import {
  AudioOutputDevice,
  setAudioOutputDevice,
  getActiveAudioOutputDevice,
} from '@vonage/client-sdk-video';
import { useState, useEffect, MouseEvent, ReactElement } from 'react';
import useDevices from '../../../../hooks/useDevices';
import DropdownSeparator from '../../DropdownSeparator';
import useAudioOutputContext from '../../../../hooks/useAudioOutputContext';

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
  const { audioOutput, setAudioOutput } = useAudioOutputContext();
  const [devicesAvailable, setDevicesAvailable] = useState<AudioOutputDevice[] | null>(null);
  const { allMediaDevices } = useDevices();

  useEffect(() => {
    setDevicesAvailable(allMediaDevices.audioOutputDevices);
  }, [allMediaDevices]);

  const changeAudioOutput = async (deviceId: string) => {
    await setAudioOutputDevice(deviceId);
    setAudioOutput(deviceId);
  };

  useEffect(() => {
    const getActiveAudioOutputDeviceLabel = async () => {
      const activeOutputDevice = await getActiveAudioOutputDevice();
      setAudioOutput(activeOutputDevice.deviceId);
    };
    getActiveAudioOutputDeviceLabel();
  }, [setAudioOutput]);

  const handleChangeAudioOutput = (event: MouseEvent<HTMLLIElement>) => {
    const menuItem = event.target as HTMLLIElement;
    handleToggle();

    const selectedDevice = devicesAvailable?.find((device: AudioOutputDevice) => {
      return device.label === menuItem.textContent;
    });

    if (selectedDevice?.deviceId) {
      changeAudioOutput(selectedDevice.deviceId);
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
        <Typography data-testid="output-devices">Speakers</Typography>
      </Box>
      <MenuList>
        {devicesAvailable?.map((device: AudioOutputDevice) => {
          const isSelected = device.deviceId === audioOutput;
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