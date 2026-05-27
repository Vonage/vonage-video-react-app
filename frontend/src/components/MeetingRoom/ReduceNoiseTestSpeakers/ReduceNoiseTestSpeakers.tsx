import { useState, useEffect, type ReactElement } from 'react';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import { useTranslation } from 'react-i18next';
import usePublisherContext from '@hooks/usePublisherContext';
import { setStorageItem, STORAGE_KEYS } from '@utils/storage';
import { mediaDevices$ } from '@core/stores';
import SwitchField from '@ui/SwitchField';
import DropdownSeparator from '../DropdownSeparator';
import SoundTest from '../../SoundTest';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import VividIcon from '@ui/VividIcon';
import Box from '@mui/material/Box';
import { env } from '../../../env';

/**
 * ReduceNoiseTestSpeakers Component
 *
 * This component displays options to enable advanced noise suppression
 * and to test the speakers.
 * @returns {ReactElement | false} Returns ReduceNoiseTestSpeakers component or false if the Vonage Media Processor is not supported.
 */
const ReduceNoiseTestSpeakers = (): ReactElement | false => {
  const { t } = useTranslation();
  const { publisher, isPublishing } = usePublisherContext();

  const [isToggled, setIsToggled] = useState(false);
  const shouldDisplayANS = hasMediaProcessorSupport('both') && env.ALLOW_ADVANCED_NOISE_SUPPRESSION;
  const hasSpeakerDevices = mediaDevices$.useMediaDevices(
    'audiooutput',
    (devices) => Object.values(devices).length > 0
  );

  const handleNoiseSuppressionChange = async (checked: boolean) => {
    setIsToggled(checked);
    setStorageItem(STORAGE_KEYS.NOISE_SUPPRESSION, JSON.stringify(checked));

    if (checked) {
      await publisher?.applyAudioFilter({ type: 'advancedNoiseSuppression' });
      return;
    }

    await publisher?.clearAudioFilter();
  };

  useEffect(() => {
    if (isPublishing) {
      const audioFilter = publisher?.getAudioFilter();

      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        {shouldDisplayANS && (
          <MenuItem className="hover:bg-vera-background">
            <div className="flex w-full items-center gap-2">
              <Box sx={{ mr: 1 }}>
                <VividIcon
                  customSize={-6}
                  name="headset-solid"
                  style={{ color: 'var(--vera-secondary)' }}
                />
              </Box>
              <div className="min-w-0 flex-1">
                <SwitchField
                  id="meeting-room-noise-suppression"
                  label={t('devices.audio.noiseSuppression')}
                  checked={isToggled}
                  onChange={handleNoiseSuppressionChange}
                  size="small"
                  labelStyle={{ fontWeight: 400 }}
                />
              </div>
            </div>
          </MenuItem>
        )}
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
