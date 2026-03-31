import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { MediaDeviceInfoJSON } from '@web/types';
import DropdownSeparator from '../DropdownSeparator';
import Box from '@mui/material/Box';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import VividIcon from '@components/VividIcon';
import { useDistinctLabelMediaDevices } from '@ui/hooks';
import { isSinkIdSupported } from '@web/platform';
import mediaDevices$ from '@core/stores/devices';
import useTheme from '@ui/theme';
import { Tooltip } from '@mui/material';
import { env } from '../../../env';

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

  const currentAudioOutputId = mediaDevices$.useDeviceId('audiooutput');

  const availableDevices = useDistinctLabelMediaDevices('audiooutput', (devices) =>
    isSinkIdSupported()
      ? devices.map((device) =>
          // Rename default audio output device to user-friendly label
          device.deviceId === 'default'
            ? { ...device, label: t('devices.audio.defaultLabel') }
            : device
        )
      : [{ deviceId: 'default', label: t('devices.audio.defaultLabel') } as MediaDeviceInfoJSON]
  );

  const handleChangeAudioOutput = async (deviceId: string) => {
    handleToggle();

    if (!isSinkIdSupported()) return;

    await mediaDevices$.actions.selectDevice('audiooutput', deviceId);
  };

  return (
    env.MEETING_ROOM_ALLOW_DEVICE_SELECTION && (
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
          <p className="text-vera-body-extended ml-4" data-testid="output-device-title">
            {t('devices.audio.speakers.full')}
          </p>
        </Box>

        <MenuList data-testid="output-devices">
          {availableDevices?.map((device: MediaDeviceInfoJSON) => {
            // If audio output device selection is not supported we show the default device as selected
            const isSelected =
              device.deviceId === currentAudioOutputId || availableDevices.length === 1;

            return (
              <MenuItem
                key={device.deviceId}
                selected={isSelected}
                onClick={() => handleChangeAudioOutput(device.deviceId)}
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
                    <Box sx={{ minWidth: 36 }} />
                  )}
                  <Tooltip title={device.label} placement="right" arrow>
                    <span className="text-vera-body-extended truncate">{device.label}</span>
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

export default OutputAudioDevices;
