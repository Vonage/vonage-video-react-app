import { Typography, IconButton, MenuList, MenuItem } from '@mui/material';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import { useState, useEffect, ReactElement } from 'react';
import Grow from '@mui/material/Grow';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import usePublisherContext from '../../../../hooks/usePublisherContext';

export type VideoDevicesOptionsProps = {
  customLightBlueColor: string;
};

/**
 * VideoDevicesOptions Component
 *
 * This component renders a drop-down menu for video device settings.
 * @param {VideoDevicesOptionsProps} props - the props for the component.
 *  @property {string} customLightBlueColor - the custom color used for the toggled icon.
 * @returns {ReactElement} The video devices options component.
 */
const VideoDevicesOptions = ({ customLightBlueColor }: VideoDevicesOptionsProps): ReactElement => {
  const { publisher } = usePublisherContext();
  const [isToggled, setIsToggled] = useState(false);

  const handleToggle = async () => {
    const newState = !isToggled;
    setIsToggled(newState);
    window.localStorage.setItem('backgroundBlur', JSON.stringify(newState));
    if (newState) {
      await publisher?.applyVideoFilter({
        type: 'backgroundBlur',
        blurStrength: 'high',
      });
    } else {
      await publisher?.clearVideoFilter();
    }
  };

  useEffect(() => {
    const videoFilter = publisher?.getVideoFilter();
    setIsToggled(videoFilter !== null);
  }, [publisher]);

  return (
    <MenuList
      sx={{
        display: 'flex',
        flexDirection: 'column',
        mt: 1,
      }}
    >
      <MenuItem
        onClick={handleToggle}
        sx={{
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.12)',
          },
        }}
      >
        <BlurOnIcon sx={{ fontSize: 24, mr: 2 }} />
        <Typography data-testid="blur-text" sx={{ mr: 2 }}>
          Blur your background
        </Typography>
        <IconButton disableRipple aria-label="Toggle background blur">
          <Grow in={!isToggled} timeout={300}>
            <ToggleOffIcon
              data-testid="toggle-off-icon"
              fontSize="large"
              sx={{ position: 'absolute', color: 'white' }}
            />
          </Grow>
          <Grow in={isToggled} timeout={300}>
            <ToggleOnIcon
              data-testid="toggle-on-icon"
              fontSize="large"
              sx={{ position: 'absolute', color: customLightBlueColor }}
            />
          </Grow>
        </IconButton>
      </MenuItem>
    </MenuList>
  );
};

export default VideoDevicesOptions;
