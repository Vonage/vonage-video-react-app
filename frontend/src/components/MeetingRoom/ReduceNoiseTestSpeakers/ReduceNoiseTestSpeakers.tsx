import { useState, useEffect, ReactElement } from 'react';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import { useTranslation } from 'react-i18next';
import useTheme from '@ui/theme';
import usePublisherContext from '@hooks/usePublisherContext';
import { setStorageItem, STORAGE_KEYS } from '@utils/storage';
import DropdownSeparator from '../DropdownSeparator';
import SoundTest from '../../SoundTest';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Grow from '@mui/material/Grow';
import VividIcon from '@components/VividIcon';
import Box from '@mui/material/Box';
import { env } from '../../../env';

/**
 * ReduceNoiseTestSpeakers Component
 *
 * This component displays options to enable advanced noise suppression
 * and to test the speakers.
 * @returns {ReactElement | false} Returns ReduceNoiseTestSpeakers component or false if the Vonage Media Processor is not supported.
 */
const ReduceNoiseTestSpeakers = (): ReactElement | false => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { publisher, isPublishing } = usePublisherContext();

  const [isToggled, setIsToggled] = useState(false);
  const shouldDisplayANS = hasMediaProcessorSupport() && env.ALLOW_ADVANCED_NOISE_SUPPRESSION;

  const handleToggle = async () => {
    const newState = !isToggled;
    setIsToggled(newState);
    setStorageItem(STORAGE_KEYS.NOISE_SUPPRESSION, JSON.stringify(newState));
    if (newState) {
      await publisher?.applyAudioFilter({ type: 'advancedNoiseSuppression' });
    } else {
      await publisher?.clearAudioFilter();
    }
  };

  useEffect(() => {
    if (isPublishing) {
      const audioFilter = publisher?.getAudioFilter();

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsToggled(audioFilter !== null);
    }
  }, [isPublishing, publisher]);

  return (
    <>
      <DropdownSeparator />
      <MenuList
        sx={{
          display: 'flex',
          flexDirection: 'column',
          mt: 1,
        }}
      >
        {shouldDisplayANS && (
          <MenuItem
            onClick={handleToggle}
            sx={{
              '&:hover': {
                backgroundColor: theme.colors.background,
              },
            }}
          >
            <Box sx={{ mr: 2 }}>
              <VividIcon
                customSize={-6}
                name="headset-solid"
                sx={{ color: theme.colors.secondary }}
              />
            </Box>
            <p className="text-vera-body-extended mr-4 truncate">
              {t('devices.audio.noiseSuppression')}
            </p>
            <IconButton disableRipple>
              <Grow in={!isToggled} timeout={300}>
                <ToggleOffIcon
                  data-testid="toggle-off-icon"
                  fontSize="large"
                  sx={{ position: 'absolute', color: theme.colors.secondary }}
                />
              </Grow>
              <Grow in={isToggled} timeout={300}>
                <ToggleOnIcon
                  data-testid="toggle-on-icon"
                  fontSize="large"
                  sx={{
                    position: 'absolute',
                    color: theme.colors.secondary,
                  }}
                />
              </Grow>
            </IconButton>
          </MenuItem>
        )}
        <SoundTest labelClassName="text-vera-body-extended">
          <Box sx={{ mr: 1.5 }}>
            <VividIcon
              customSize={-5}
              name="audio-mid-solid"
              sx={{ color: theme.colors.secondary }}
            />
          </Box>
        </SoundTest>
      </MenuList>
    </>
  );
};

export default ReduceNoiseTestSpeakers;
