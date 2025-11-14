import { Box, MenuItem, MenuList, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { Device } from '@vonage/client-sdk-video';
import MicNoneIcon from '@mui/icons-material/MicNone';
import { MouseEvent as ReactMouseEvent, ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useAppConfig from '@Context/AppConfig/hooks/useAppConfig';
import useDevices from '../../../hooks/useDevices';
import usePublisherContext from '../../../hooks/usePublisherContext';
import { setStorageItem, STORAGE_KEYS } from '../../../utils/storage';
import cleanAndDedupeDeviceLabels from '../../../utils/cleanAndDedupeDeviceLabels';
import { colors } from '../../../utils/customTheme/customTheme';

export type InputDevicesProps = {
  handleToggle: () => void;
};

/**
 * InputDevices Component
 *
 * Displays the audio input devices for a user. Handles switching audio input devices.
 * @param {InputDevicesProps} props - The props for the component.
 *  @property {Function} handleToggle - The click handler to handle closing the menu.
 * @returns {ReactElement | false} - The InputDevices component.
 */
const InputDevices = ({ handleToggle }: InputDevicesProps): ReactElement | false => {
  const { t } = useTranslation();
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
            ml: 2,
            mt: 1,
            mb: 0.5,
          }}
        >
          <MicNoneIcon sx={{ fontSize: 24, mr: 2 }} />
          <Typography>{t('devices.audio.microphone.full')}</Typography>
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
                    color: colors.background,
                  },
                  '&:hover': {
                    backgroundColor: colors.primaryHover,
                  },
                }}
              >
                <Box
                  key={`${option}-input-device`}
                  sx={{
                    display: 'flex',
                    mb: 0.5,
                    overflow: 'hidden',
                  }}
                >
                  {isSelected ? (
                    <CheckIcon sx={{ color: colors.background, fontSize: 24, mr: 2 }} />
                  ) : (
                    <Box sx={{ width: 40 }} /> // Placeholder when CheckIcon is not displayed
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

export default InputDevices;
