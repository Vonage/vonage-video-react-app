import usePublisherContext from '@hooks/usePublisherContext';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import advancedSettings$ from '@Context/AdvancedSettings';
import tryCatch from '@common/execution/tryCatch';
import {
  applyFrameRate,
  applyResolution,
  applyBitrate,
} from '@Context/PublisherProvider/useApplyAdvancedSettings';
import type {
  AdvancedSettingsBitrateMode,
  AdvancedSettingsCustomVideoBitrate,
  AdvancedSettingsFrameRate,
  AdvancedSettingsResolution,
} from '../types/types';
import { ADVANCED_SETTINGS_BITRATE_MODE } from '../types/types';

const { setBitrateMode, setCustomVideoBitrate, setFrameRate, setResolution } =
  advancedSettings$.actions;

type UseAdvancedSettingsVideoHandlersArgs = {
  bitrateMode: AdvancedSettingsBitrateMode;
  customVideoBitrate: AdvancedSettingsCustomVideoBitrate;
};

type UseAdvancedSettingsVideoHandlers = {
  handleFrameRateChange: (value: AdvancedSettingsFrameRate) => void;
  handleResolutionChange: (value: AdvancedSettingsResolution) => void;
  handleBitrateModeChange: (value: AdvancedSettingsBitrateMode) => void;
  handleCustomVideoBitrateChange: (value: AdvancedSettingsCustomVideoBitrate) => void;
};

const useAdvancedSettingsVideoHandlers = ({
  bitrateMode,
  customVideoBitrate,
}: UseAdvancedSettingsVideoHandlersArgs): UseAdvancedSettingsVideoHandlers => {
  const { publisher: meetingRoomPublisher } = usePublisherContext();
  const { publisher: previewPublisher } = usePreviewPublisherContext();
  const publisher = meetingRoomPublisher ?? previewPublisher ?? null;

  const handleFrameRateChange = (value: AdvancedSettingsFrameRate) => {
    void (async () => {
      const { error } = await tryCatch(() => applyFrameRate(publisher, value));
      if (error) return;
      setFrameRate(value);
    })();
  };

  const handleResolutionChange = (value: AdvancedSettingsResolution) => {
    void (async () => {
      const { error } = await tryCatch(() => applyResolution(publisher, value));
      if (error) return;
      setResolution(value);
    })();
  };

  const handleBitrateModeChange = (value: AdvancedSettingsBitrateMode) => {
    void (async () => {
      const { error } = await tryCatch(() => applyBitrate(publisher, value, customVideoBitrate));
      if (error) return;
      setBitrateMode(value);
    })();
  };

  const handleCustomVideoBitrateChange = (value: AdvancedSettingsCustomVideoBitrate) => {
    void (async () => {
      if (bitrateMode === ADVANCED_SETTINGS_BITRATE_MODE.custom) {
        const { error } = await tryCatch(() => applyBitrate(publisher, bitrateMode, value));
        if (error) return;
      }
      setCustomVideoBitrate(value);
    })();
  };

  return {
    handleFrameRateChange,
    handleResolutionChange,
    handleBitrateModeChange,
    handleCustomVideoBitrateChange,
  };
};

export default useAdvancedSettingsVideoHandlers;
