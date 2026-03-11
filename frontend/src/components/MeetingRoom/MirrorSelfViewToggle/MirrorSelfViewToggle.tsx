import { ReactElement } from 'react';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import { useTranslation } from 'react-i18next';
import { setStorageItem, STORAGE_KEYS } from '@utils/storage';
import MenuItem from '@mui/material/MenuItem';
import Grow from '@mui/material/Grow';
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
      role="menuitemcheckbox"
      aria-checked={isToggled}
      className="flex items-center gap-3 rounded-vera-medium px-3 py-2 text-vera-on-surface hover:bg-vera-background focus-visible:outline-none"
    >
      <FlipIcon className="h-6 w-6 text-vera-secondary" />
      <span className="flex-1 truncate text-base font-normal">
        {t('devices.video.mirrorSelfView')}
      </span>
      <span className="relative flex h-6 w-11 items-center justify-center">
        <Grow in={!isToggled} timeout={300}>
          <ToggleOffIcon
            data-testid="mirror-toggle-off-icon"
            className="absolute inset-0 h-6 w-11 text-vera-secondary"
          />
        </Grow>
        <Grow in={isToggled} timeout={300}>
          <ToggleOnIcon
            data-testid="mirror-toggle-on-icon"
            className="absolute inset-0 h-6 w-11 text-vera-secondary"
          />
        </Grow>
      </span>
    </MenuItem>
  );
};

export default MirrorSelfViewToggle;
