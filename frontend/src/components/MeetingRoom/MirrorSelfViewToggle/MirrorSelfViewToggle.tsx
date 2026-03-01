import { ReactElement } from 'react';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import { useTranslation } from 'react-i18next';
import useTheme from '@ui/theme';
import { setStorageItem, STORAGE_KEYS } from '@utils/storage';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Grow from '@mui/material/Grow';
import Box from '@mui/material/Box';
import FlipIcon from '@mui/icons-material/Flip';
import useUserContext from '@hooks/useUserContext';

/**
 * MirrorSelfViewToggle Component
 *
 * Renders a toggle menu item in the camera device dropdown that enables or disables
 * horizontal mirroring of the self-view. The preference is persisted in localStorage.
 * Follows the same pattern as the Advanced Noise Suppression toggle in the audio menu.
 * @returns {ReactElement} The MirrorSelfViewToggle component.
 */
const MirrorSelfViewToggle = (): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, setUser } = useUserContext();
  const isToggled = user.defaultSettings.mirrorSelfView;

  const handleToggle = () => {
    const newValue = !isToggled;
    setStorageItem(STORAGE_KEYS.MIRROR_SELF_VIEW, String(newValue));
    setUser((prev) => ({
      ...prev,
      defaultSettings: {
        ...prev.defaultSettings,
        mirrorSelfView: newValue,
      },
    }));
  };

  return (
    <MenuItem
      onClick={handleToggle}
      sx={{
        '&:hover': {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Box sx={{ mr: 2 }}>
        <FlipIcon sx={{ fontSize: 24, color: theme.colors.secondary }} />
      </Box>
      <Typography variant="body1" noWrap sx={{ mr: 2 }}>
        {t('devices.video.mirrorSelfView')}
      </Typography>
      <IconButton disableRipple>
        <Grow in={!isToggled} timeout={300}>
          <ToggleOffIcon
            data-testid="mirror-toggle-off-icon"
            fontSize="large"
            sx={{ position: 'absolute', color: theme.colors.secondary }}
          />
        </Grow>
        <Grow in={isToggled} timeout={300}>
          <ToggleOnIcon
            data-testid="mirror-toggle-on-icon"
            fontSize="large"
            sx={{ position: 'absolute', color: theme.colors.secondary }}
          />
        </Grow>
      </IconButton>
    </MenuItem>
  );
};

export default MirrorSelfViewToggle;
