import { Typography, MenuList, MenuItem } from '@mui/material';
import { ReactElement } from 'react';
import PortraitIcon from '@mui/icons-material/Portrait';
import { useTranslation } from 'react-i18next';

export type VideoDevicesOptionsProps = {
  toggleBackgroundEffects: () => void;
};

/**
 * VideoDevicesOptions Component
 *
 * This component renders a drop-down menu for video device settings (Background Effects).
 * @param {VideoDevicesOptionsProps} props - the props for the component.
 * @property {Function} toggleBackgroundEffects - Function to toggle background effects.
 * @returns {ReactElement} The video devices options component.
 */
const VideoDevicesOptions = ({
  toggleBackgroundEffects,
}: VideoDevicesOptionsProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <MenuList
      sx={{
        display: 'flex',
        flexDirection: 'column',
        mt: 1,
      }}
    >
      <MenuItem
        onClick={toggleBackgroundEffects}
        sx={(theme) => ({
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: theme.palette.hover.main,
          },
        })}
      >
        <PortraitIcon sx={{ fontSize: 24, mr: 2 }} />
        <Typography data-testid="background-effects-text" sx={{ mr: 2 }}>
          {t('backgroundEffects.title')}
        </Typography>
      </MenuItem>
    </MenuList>
  );
};

export default VideoDevicesOptions;
