import { ReactElement } from 'react';
import FlipIcon from '@mui/icons-material/Flip';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import useTheme from '@ui/theme';
import { VIDEO_CONTAINER_BUTTON_SIZE_WR } from '@utils/constants';
import VideoContainerButton from '../VideoContainerButton';
import useUserContext from '../../../hooks/useUserContext';
import { setStorageItem, STORAGE_KEYS } from '../../../utils/storage';

/**
 * MirrorSelfViewButton Component
 *
 * Displays a badge-style icon button in the upper-right of the waiting room video tile
 * that toggles horizontal mirroring of the self-view. The preference is persisted in localStorage.
 * @returns {ReactElement} The MirrorSelfViewButton component.
 */
const MirrorSelfViewButton = (): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, setUser } = useUserContext();
  const isMirrored = user.defaultSettings.mirrorSelfView;

  const handleToggle = () => {
    const newValue = !isMirrored;
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
    <Box
      sx={{
        display: 'flex',
        width: `${VIDEO_CONTAINER_BUTTON_SIZE_WR}px`,
        height: `${VIDEO_CONTAINER_BUTTON_SIZE_WR}px`,
        borderRadius: '50%',
        border: `1px solid ${theme.colors.onSecondary}`,
        overflow: 'hidden',
      }}
    >
      <Tooltip
        arrow
        title={t('devices.video.mirrorSelfView')}
        aria-label={t('devices.video.mirrorSelfView')}
      >
        <VideoContainerButton
          onClick={handleToggle}
          sx={{
            '&:hover': {
              backgroundColor: `${theme.colors.onSecondary}99`,
            },
          }}
          icon={
            <FlipIcon
              sx={{
                fontSize: '24px',
                color: isMirrored ? theme.colors.accent : theme.colors.onSecondary,
              }}
              data-testid="mirror-self-view-icon"
            />
          }
        />
      </Tooltip>
    </Box>
  );
};

export default MirrorSelfViewButton;
