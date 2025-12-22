import Box from '@ui/Box';
import Typography from '@ui/Typography';
import MenuItem from '@ui/MenuItem';
import MenuList from '@ui/MenuList';
import { Device } from '@vonage/client-sdk-video';
import { MouseEvent as ReactMouseEvent, ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useAppConfig from '@Context/AppConfig/hooks/useAppConfig';
import useTheme from '@ui/theme';
import VividIcon from '@components/VividIcon';
import useDevices from '@hooks/useDevices';
import usePublisherContext from '@hooks/usePublisherContext';
import { setStorageItem, STORAGE_KEYS } from '@utils/storage';
import cleanAndDedupeDeviceLabels from '@utils/cleanAndDedupeDeviceLabels';

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

  const allowDeviceSelection = useAppConfig(
    ({ meetingRoomSettings }) => meetingRoomSettings.allowDeviceSelection
  );

  const {
    allMediaDevices: { audioInputDevices },
  } = useDevices();

  const audioInputDevicesCleaned = useMemo(
    () => cleanAndDedupeDeviceLabels(audioInputDevices),
    [audioInputDevices]
  );

  const options = audioInputDevicesCleaned.map((availableDevice) => {
    return availableDevice.label || t('unknown.device');
  });

  const handleChangeAudioSource = (event: ReactMouseEvent<HTMLLIElement>) => {
    const menuItem = event.target as HTMLLIElement;
    handleToggle();
    const audioDeviceId = audioInputDevices?.find((device: Device) => {
      return device.label === menuItem.textContent;
    })?.deviceId;
    if (audioDeviceId) {
      publisher?.setAudioSource(audioDeviceId);
      setStorageItem(STORAGE_KEYS.AUDIO_SOURCE, audioDeviceId);
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
                    <Box sx={{ minWidth: 36 }} /> // Placeholder when CheckIcon is not displayed
                  )}
                  <Typography noWrap>{option}</Typography>
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
