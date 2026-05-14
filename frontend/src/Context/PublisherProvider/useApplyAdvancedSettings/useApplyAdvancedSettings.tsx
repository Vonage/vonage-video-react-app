import { useEffect } from 'react';
import type { Publisher } from '@vonage/client-sdk-video';
import advancedSettings$ from '@Context/AdvancedSettings';
import applyAdvancedSettingsToPublisher from './applyAdvancedSettingsToPublisher';

const useApplyAdvancedSettings = (publisher: Publisher | null): void => {
  useEffect(() => {
    if (!publisher) return;

    const { frameRate, resolution, bitrateMode, customVideoBitrate } = advancedSettings$.getState();

    void applyAdvancedSettingsToPublisher(publisher, {
      frameRate,
      resolution,
      bitrateMode,
      customVideoBitrate,
    });
  }, [publisher]);
};

export default useApplyAdvancedSettings;
