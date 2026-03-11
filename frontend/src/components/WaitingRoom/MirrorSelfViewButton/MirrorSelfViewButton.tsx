import { ReactElement } from 'react';
import FlipIcon from '@mui/icons-material/Flip';
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';
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
    <div
      className="flex items-center justify-center overflow-hidden rounded-full border border-vera-on-secondary"
      style={{
        width: `${VIDEO_CONTAINER_BUTTON_SIZE_WR}px`,
        height: `${VIDEO_CONTAINER_BUTTON_SIZE_WR}px`,
      }}
    >
      <Tooltip
        arrow
        title={t('devices.video.mirrorSelfView')}
        aria-label={t('devices.video.mirrorSelfView')}
      >
        <VideoContainerButton
          onClick={handleToggle}
          aria-label={t('devices.video.mirrorSelfView')}
          className="hover:bg-vera-on-secondary/60 focus-visible:outline-none"
          icon={
            <FlipIcon
              className={`h-6 w-6 ${isMirrored ? 'text-vera-accent' : 'text-vera-on-secondary'}`}
              data-testid="mirror-self-view-icon"
            />
          }
        />
      </Tooltip>
    </div>
  );
};

export default MirrorSelfViewButton;
