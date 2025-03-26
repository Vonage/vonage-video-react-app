import { Typography, MenuItem, IconButton, MenuList } from '@mui/material';
import { useState, useEffect, ReactElement } from 'react';
import Grow from '@mui/material/Grow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import HeadsetIcon from '@mui/icons-material/Headset';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import usePublisherContext from '../../../../hooks/usePublisherContext';
import DropdownSeparator from '../../DropdownSeparator';
import SoundTest from '../../../SoundTest';

export type ReduceNoiseTestSpeakersProps = {
  customLightBlueColor: string;
};

/**
 * ReduceNoiseTestSpeakers Component
 *
 * This component displays options to enable advanced noise suppression
 * and to test the speakers.
 * @param {ReduceNoiseTestSpeakersProps} props - the props for the component.
 *  @property {string} customLightBlueColor - the custom color used for the toggled icon.
 * @returns {ReactElement | false} Returns ReduceNoiseTestSpeakers component or false if the Vonage Media Processor is not supported.
 */
const ReduceNoiseTestSpeakers = ({
  customLightBlueColor,
}: ReduceNoiseTestSpeakersProps): ReactElement | false => {
  const { publisher, isPublishing } = usePublisherContext();
  const [isToggled, setIsToggled] = useState(false);

  const handleToggle = async () => {
    const newState = !isToggled;
    setIsToggled(newState);
    window.localStorage.setItem('noiseSuppression', JSON.stringify(newState));
    if (newState) {
      await publisher?.applyAudioFilter({ type: 'advancedNoiseSuppression' });
    } else {
      await publisher?.clearAudioFilter();
    }
  };

  useEffect(() => {
    if (isPublishing) {
      const audioFilter = publisher?.getAudioFilter();
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
        {hasMediaProcessorSupport() && (
          <MenuItem
            onClick={handleToggle}
            sx={{
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.12)',
              },
            }}
          >
            <HeadsetIcon sx={{ fontSize: 24, mr: 2 }} />
            <Typography noWrap sx={{ mr: 2 }}>
              Advanced Noise Suppression
            </Typography>
            <IconButton disableRipple>
              <Grow in={!isToggled} timeout={300}>
                <ToggleOffIcon fontSize="large" sx={{ position: 'absolute', color: 'white' }} />
              </Grow>
              <Grow in={isToggled} timeout={300}>
                <ToggleOnIcon
                  fontSize="large"
                  sx={{ position: 'absolute', color: customLightBlueColor }}
                />
              </Grow>
            </IconButton>
          </MenuItem>
        )}
        <SoundTest>
          <VolumeUpIcon sx={{ fontSize: 24, mr: 2 }} />
        </SoundTest>
      </MenuList>
    </>
  );
};

export default ReduceNoiseTestSpeakers;
