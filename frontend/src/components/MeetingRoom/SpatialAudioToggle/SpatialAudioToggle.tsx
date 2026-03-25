import { ReactElement } from 'react';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import { useTranslation } from 'react-i18next';
import useTheme from '@ui/theme';
import useSessionContext from '@hooks/useSessionContext';
import hasWebAudioSupport from '@utils/hasWebAudioSupport';
import DropdownSeparator from '../DropdownSeparator';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Grow from '@mui/material/Grow';
import VividIcon from '@components/VividIcon';
import Box from '@mui/material/Box';

/**
 * SpatialAudioToggle Component
 *
 * Displays a toggle row in the audio settings (Mic Panel) that enables or disables
 * Spatial Audio. When enabled, each remote participant's audio is panned left or
 * right based on their tile's horizontal position on screen.
 *
 * Rendered only when the browser supports the Web Audio API with StereoPannerNode.
 *
 * @returns {ReactElement | null} The SpatialAudioToggle component, or null if unsupported.
 */
const SpatialAudioToggle = (): ReactElement | null => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isSpatialAudioEnabled, toggleSpatialAudio } = useSessionContext();

  if (!hasWebAudioSupport()) {
    return null;
  }

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
        <MenuItem
          onClick={toggleSpatialAudio}
          role="menuitemcheckbox"
          aria-checked={isSpatialAudioEnabled}
          aria-label={t('spatialAudio.ariaLabel')}
          sx={{
            '&:hover': {
              backgroundColor: theme.colors.background,
            },
          }}
        >
          <Box sx={{ mr: 2 }}>
            <VividIcon
              customSize={-5}
              name="headset-solid"
              sx={{ color: theme.colors.secondary }}
            />
          </Box>
          <Typography variant="body1" noWrap sx={{ mr: 2 }}>
            {t('spatialAudio.label')}
          </Typography>
          <IconButton disableRipple>
            <Grow in={!isSpatialAudioEnabled} timeout={300}>
              <ToggleOffIcon
                data-testid="spatial-audio-toggle-off"
                fontSize="large"
                sx={{ position: 'absolute', color: theme.colors.secondary }}
              />
            </Grow>
            <Grow in={isSpatialAudioEnabled} timeout={300}>
              <ToggleOnIcon
                data-testid="spatial-audio-toggle-on"
                fontSize="large"
                sx={{ position: 'absolute', color: theme.colors.secondary }}
              />
            </Grow>
          </IconButton>
        </MenuItem>
      </MenuList>
    </>
  );
};

export default SpatialAudioToggle;
