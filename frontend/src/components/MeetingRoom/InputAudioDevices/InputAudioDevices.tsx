import { Box, MenuItem, MenuList, Typography } from '@mui/material';
import { MouseEvent as ReactMouseEvent, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import appConfig$ from '@stores/appConfig';
import useTheme from '@ui/theme';
import VividIcon from '@components/VividIcon';
import usePublisherContext from '@hooks/usePublisherContext';
import Tooltip from '@ui/Tooltip';
import { useDistinctLabelMediaDevices } from '@ui/hooks';
import mediaDevices$ from '@core/stores/devices';

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
  const { publisher } = usePublisherContext();

  const allowDeviceSelection = appConfig$.use.select(
    ({ meetingRoomSettings }) => meetingRoomSettings.allowDeviceSelection
  );

  const audioInputDevices = useDistinctLabelMediaDevices('audioinput');

  const options = audioInputDevices.map((availableDevice) => {
    return availableDevice.label || t('unknown.device');
  });

  const handleChangeAudioSource = (event: ReactMouseEvent<HTMLLIElement>) => {
    const menuItem = event.target as HTMLLIElement;
    handleToggle();
    const audioDeviceId = audioInputDevices?.find((device) => {
      return device.label === menuItem.textContent;
    })?.deviceId;
    if (audioDeviceId) {
      // [TODO:] Check this while refactoring the publishers... for vera apps this ids must be the same all the time.
      publisher?.setAudioSource(audioDeviceId);
      mediaDevices$.actions.selectDevice('audioinput', audioDeviceId);
    }
  };

  return (
    allowDeviceSelection && (
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
          <VividIcon name="microphone-2-line" customSize={-5} />
          <Typography sx={{ ml: 2 }}>{t('devices.audio.microphone.full')}</Typography>
        </Box>
        <MenuList>
          {options.map((option: string) => {
            const isSelected = option === publisher?.getAudioSource().label;
            return (
              <MenuItem
                key={option}
                selected={isSelected}
                onClick={(event) => handleChangeAudioSource(event)}
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
                  key={`${option}-input-device`}
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
                  <Tooltip title={option} placement="right" arrow>
                    <Typography component="span" noWrap>
                      {option}
                    </Typography>
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
