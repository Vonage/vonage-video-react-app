import { Box, MenuItem, MenuList, Tooltip } from '@mui/material';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import useTheme from '@ui/theme';
import VividIcon from '@components/VividIcon';
import { useDistinctLabelMediaDevices } from '@ui/hooks';
import mediaDevices$ from '@core/stores/devices';
import { env } from '../../../env';

export type InputAudioDevicesProps = {
  handleToggle: () => void;
};

/**
 * InputAudioDevices Component
 *
 * Displays the audio input devices for a user. Handles switching audio input devices.
 * @param {InputAudioDevicesProps} props - The props for the component.
 *  @property {Function} handleToggle - The click handler to handle closing the menu.
 * @returns {ReactElement | false} - The InputAudioDevices component.
 */
const InputAudioDevices = ({ handleToggle }: InputAudioDevicesProps): ReactElement | false => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Use store's selection as source of truth, not publisher.getAudioSource() which can be stale
  const selectedDeviceId = mediaDevices$.useDeviceId('audioinput');

  const audioInputDevices = useDistinctLabelMediaDevices('audioinput', (devices) =>
    devices.map((device) => ({
      ...device,
      label: device.label || t('unknown.device'),
    }))
  );

  const handleChangeAudioSource = (deviceId: string) => {
    handleToggle();
    void mediaDevices$.actions.selectDevice('audioinput', deviceId);
  };

  return (
    env.MEETING_ROOM_ALLOW_DEVICE_SELECTION && (
      <>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            ml: 2,
            mt: 1,
            mb: 0.5,
            color: theme.colors.tertiary,
          }}
        >
          <VividIcon name="microphone-2-line" customSize={-6} />
          <p className="text-vera-body-extended ml-4">{t('devices.audio.microphone.full')}</p>
        </Box>
        <MenuList>
          {audioInputDevices.map((device) => {
            const isSelected = device.deviceId === selectedDeviceId;
            return (
              <MenuItem
                key={device.deviceId}
                selected={isSelected}
                onClick={() => handleChangeAudioSource(device.deviceId)}
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
                    <Box key={'input-audio-devices-check'} sx={{ mr: 2.5 }}>
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

export default InputAudioDevices;
