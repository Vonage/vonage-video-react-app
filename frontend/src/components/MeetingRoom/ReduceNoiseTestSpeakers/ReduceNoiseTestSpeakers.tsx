import { type ReactElement } from 'react';
import { mediaDevices$ } from '@core/stores';
import SoundTest from '../../SoundTest';
import MenuList from '@mui/material/MenuList';
import VividIcon from '@ui/components/VividIcon';
import Box from '@mui/material/Box';

/**
 * ReduceNoiseTestSpeakers Component
 *
 * This component displays the option to test the speakers.
 * @returns {ReactElement} Returns ReduceNoiseTestSpeakers component.
 */
const ReduceNoiseTestSpeakers = (): ReactElement => {
  const hasSpeakerDevices = mediaDevices$.useMediaDevices(
    'audiooutput',
    (devices) => Object.values(devices).length > 0
  );

  return (
    <MenuList className="mt-2! flex flex-col">
      {hasSpeakerDevices && (
        <SoundTest labelClassName="text-vera-body-extended">
          <Box className="mr-3">
            <VividIcon
              customSize={-5}
              name="audio-mid-solid"
              style={{ color: 'var(--vera-secondary)' }}
            />
          </Box>
        </SoundTest>
      )}
    </MenuList>
  );
};

export default ReduceNoiseTestSpeakers;
