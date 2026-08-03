import { type ReactElement } from 'react';
import { mediaDevices$ } from '@core/stores';
import DropdownSeparator from '../DropdownSeparator';
import SoundTest from '../../SoundTest';
import MenuList from '@mui/material/MenuList';
import VividIcon from '@ui/components/VividIcon';
import Box from '@mui/material/Box';

/**
 * ReduceNoiseTestSpeakers Component
 *
 * This component displays the option to test the speakers.
 * @returns {ReactElement | false} Returns ReduceNoiseTestSpeakers component.
 */
const ReduceNoiseTestSpeakers = (): ReactElement | false => {
  const hasSpeakerDevices = mediaDevices$.useMediaDevices(
    'audiooutput',
    (devices) => Object.values(devices).length > 0
  );

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
        {hasSpeakerDevices && (
          <SoundTest labelClassName="text-vera-body-extended">
            <Box sx={{ mr: 1.5 }}>
              <VividIcon
                customSize={-5}
                name="audio-mid-solid"
                style={{ color: 'var(--vera-secondary)' }}
              />
            </Box>
          </SoundTest>
        )}
      </MenuList>
    </>
  );
};

export default ReduceNoiseTestSpeakers;
