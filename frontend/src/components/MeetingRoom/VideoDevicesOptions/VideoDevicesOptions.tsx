import { Typography, MenuList, MenuItem } from '@mui/material';
import { ReactElement } from 'react';
import PortraitIcon from '@mui/icons-material/Portrait';

export type VideoDevicesOptionsProps = {
  toggleBackgroundEffects: () => void;
};

/**
 * VideoDevicesOptions Component
 *
 * This component renders a drop-down menu for video device settings.
 * @param {VideoDevicesOptionsProps} props - the props for the component.
 *  @property {string} customLightBlueColor - the custom color used for the toggled icon.
 * @returns {ReactElement} The video devices options component.
 */
const VideoDevicesOptions = ({
  toggleBackgroundEffects,
}: VideoDevicesOptionsProps): ReactElement => {
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
        sx={{
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.12)',
          },
        }}
      >
        <PortraitIcon sx={{ fontSize: 24, mr: 2 }} />
        <Typography data-testid="background-effects-text" sx={{ mr: 2 }}>
          Background effects
        </Typography>
      </MenuItem>
    </MenuList>
  );
};

export default VideoDevicesOptions;
