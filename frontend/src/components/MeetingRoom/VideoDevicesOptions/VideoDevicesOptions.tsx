import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import VividIcon from '@ui/components/VividIcon';

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
      <MenuItem onClick={toggleBackgroundEffects} className="gap-4 hover:bg-vera-background">
        <VividIcon
          name="background-blur-light-line"
          customSize={-5}
          className="text-inherit"
          aria-hidden="true"
        />
        <Typography data-testid="background-effects-text" sx={{ mr: 2 }}>
          {t('backgroundEffects.title')}
        </Typography>
      </MenuItem>
    </MenuList>
  );
};

export default VideoDevicesOptions;
