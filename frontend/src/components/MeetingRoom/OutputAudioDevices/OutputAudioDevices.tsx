import { MouseEvent, ReactElement, useMemo } from 'react';
import type { AudioOutputDevice } from '@vonage/client-sdk-video';
import { useTranslation } from 'react-i18next';
import { useAppConfig } from '@stores/appConfig';
import useTheme from '@ui/theme';
import useDevices from '@hooks/useDevices';
import useAudioOutputContext from '@hooks/useAudioOutputContext';
import { isGetActiveAudioOutputDeviceSupported } from '@utils/util';
import cleanAndDedupeDeviceLabels from '@utils/cleanAndDedupeDeviceLabels';
import DropdownSeparator from '../DropdownSeparator';
import Box from '@ui/Box';
import Typography from '@ui/Typography';
import MenuList from '@ui/MenuList';
import MenuItem from '@ui/MenuItem';
import VividIcon from '@components/VividIcon';

export type OutputAudioDevicesProps = {
  handleToggle: () => void;
};

/**
 * OutputAudioDevices Component
 *
 * Displays and switches audio output devices.
 * @param {OutputAudioDevicesProps} props - The props for the component.
 *  @property {() => void} handleToggle - Function to close the menu.
 * @returns {ReactElement | false} - The OutputAudioDevices component.
 */
const OutputAudioDevices = ({ handleToggle }: OutputAudioDevicesProps): ReactElement | false => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { currentAudioOutputDevice, setAudioOutputDevice } = useAudioOutputContext();

  const allowDeviceSelection = useAppConfig(
    ({ meetingRoomSettings }) => meetingRoomSettings.allowDeviceSelection
  );

  const {
    allMediaDevices: { audioOutputDevices },
  } = useDevices();
  const defaultOutputDevices = [{ deviceId: 'default', label: t('devices.audio.defaultLabel') }];

  const isAudioOutputSupported = isGetActiveAudioOutputDeviceSupported();

  const availableDevices = isAudioOutputSupported ? audioOutputDevices : defaultOutputDevices;
  const availableDevicesCleaned = useMemo(
    () => cleanAndDedupeDeviceLabels(availableDevices),
    [availableDevices]
  );

  const handleChangeAudioOutput = async (event: MouseEvent<HTMLLIElement>) => {
    const menuItem = event.target as HTMLLIElement;
    handleToggle();

    if (isAudioOutputSupported) {
      const deviceId = availableDevicesCleaned?.find((device: AudioOutputDevice) => {
        return device.label === menuItem.textContent;
      })?.deviceId;

      if (deviceId) {
        await setAudioOutputDevice(deviceId);
      }
    }
  };

  return (
    allowDeviceSelection && (
      <>
        <DropdownSeparator />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            ml: 2,
            mt: 2,
            mb: 0.5,
            color: theme.colors.tertiary,
          }}
        >
          <VividIcon name="audio-mid-line" customSize={-5} />
          <Typography sx={{ ml: 2 }} data-testid="output-device-title">
            {t('devices.audio.speakers.full')}
          </Typography>
        </Box>
        <MenuList data-testid="output-devices">
          {availableDevicesCleaned?.map((device: AudioOutputDevice) => {
            // If audio output device selection is not supported we show the default device as selected
            const isSelected =
              device.deviceId === currentAudioOutputDevice || availableDevicesCleaned.length === 1;
            return (
              <MenuItem
                key={device.deviceId}
                selected={isSelected}
                onClick={handleChangeAudioOutput}
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
                  key={`${device.deviceId}-input-device`}
                  sx={{
                    display: 'flex',
                    mb: 0.5,
                    overflow: 'hidden',
                    color: isSelected ? theme.colors.textPrimary : theme.colors.textSecondary,
                  }}
                >
                  {isSelected ? (
                    <Box key={'output-audio-devices-check'} sx={{ mr: 2.5 }}>
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
                  <Typography noWrap>{device.label}</Typography>
                </Box>
              </MenuItem>
            );
          })}
        </MenuList>
      </>
    )
  );
};

export default OutputAudioDevices;
