import { useEffect } from 'react';
import type { Publisher } from '@vonage/client-sdk-video';
import advancedSettings$ from '@Context/AdvancedSettings';
import { ADVANCED_SETTINGS_BITRATE_MODE } from '@components/AdvancedSettingsDialog/types/types';
import type { AdvancedSettingsResolution } from '@components/AdvancedSettingsDialog/types/types';

const parseResolution = (resolution: AdvancedSettingsResolution) => {
  const [width, height] = resolution.split('x').map(Number);
  return { width, height };
};

const useApplyAdvancedSettings = (publisher: Publisher | null): void => {
  const frameRate = advancedSettings$.use.select((state) => state.frameRate);
  const resolution = advancedSettings$.use.select((state) => state.resolution);
  const bitrateMode = advancedSettings$.use.select((state) => state.bitrateMode);
  const customVideoBitrate = advancedSettings$.use.select((state) => state.customVideoBitrate);

  useEffect(() => {
    if (!publisher) return;

    publisher.setPreferredFrameRate(frameRate).catch((error: unknown) => {
      console.error('useApplyAdvancedSettings: setPreferredFrameRate failed', error);
    });

    publisher.setPreferredResolution(parseResolution(resolution)).catch((error: unknown) => {
      console.error('useApplyAdvancedSettings: setPreferredResolution failed', error);
    });

    if (bitrateMode === ADVANCED_SETTINGS_BITRATE_MODE.custom) {
      publisher.setMaxVideoBitrate(customVideoBitrate).catch((error: unknown) => {
        console.error('useApplyAdvancedSettings: setMaxVideoBitrate failed', error);
      });
    } else {
      publisher.setVideoBitratePreset(bitrateMode).catch((error: unknown) => {
        console.error('useApplyAdvancedSettings: setVideoBitratePreset failed', error);
      });
    }
  }, [publisher, frameRate, resolution, bitrateMode, customVideoBitrate]);
};

export default useApplyAdvancedSettings;
