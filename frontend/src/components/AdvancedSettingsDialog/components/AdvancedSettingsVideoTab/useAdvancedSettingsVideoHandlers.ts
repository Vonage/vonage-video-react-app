import usePublisherContext from '@hooks/usePublisherContext';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import advancedSettings$ from '@Context/AdvancedSettings';
import { makeApplicationErrorMapper } from '@core/errors';
import { handleClientApplicationError } from '@ui/helpers';
import {
  applyFrameRate,
  applyResolution,
  applyBitrate,
} from '@Context/PublisherProvider/useApplyAdvancedSettings';
import { t } from 'i18next';
import type {
  AdvancedSettingsBitrateMode,
  AdvancedSettingsCustomVideoBitrate,
  AdvancedSettingsFrameRate,
  AdvancedSettingsResolution,
} from '../../types/types';
import { ADVANCED_SETTINGS_BITRATE_MODE } from '../../types/types';

const { setBitrateMode, setCustomVideoBitrate, setFrameRate, setResolution } =
  advancedSettings$.actions;

type UseAdvancedSettingsVideoHandlersArgs = {
  bitrateMode: AdvancedSettingsBitrateMode;
  customVideoBitrate: AdvancedSettingsCustomVideoBitrate;
};

type UseAdvancedSettingsVideoHandlers = {
  handleFrameRateChange: (value: AdvancedSettingsFrameRate) => Promise<void>;
  handleResolutionChange: (value: AdvancedSettingsResolution) => Promise<void>;
  handleBitrateModeChange: (value: AdvancedSettingsBitrateMode) => Promise<void>;
  handleCustomVideoBitrateChange: (value: AdvancedSettingsCustomVideoBitrate) => Promise<void>;
};

const useAdvancedSettingsVideoHandlers = ({
  bitrateMode,
  customVideoBitrate,
}: UseAdvancedSettingsVideoHandlersArgs): UseAdvancedSettingsVideoHandlers => {
  const { publisher: meetingRoomPublisher } = usePublisherContext();
  const { publisher: previewPublisher } = usePreviewPublisherContext();
  const publisher = meetingRoomPublisher ?? previewPublisher ?? null;

  const handleFrameRateChange = async (value: AdvancedSettingsFrameRate) => {
    try {
      await applyFrameRate(publisher, value);
      setFrameRate(value);
    } catch (error) {
      handleClientApplicationError(makeApplicationErrorMapper(t('errors.unknown'))(error));
    }
  };

  const handleResolutionChange = async (value: AdvancedSettingsResolution) => {
    try {
      await applyResolution(publisher, value);
      setResolution(value);
    } catch (error) {
      handleClientApplicationError(makeApplicationErrorMapper(t('errors.unknown'))(error));
    }
  };

  const handleBitrateModeChange = async (value: AdvancedSettingsBitrateMode) => {
    try {
      await applyBitrate(publisher, value, customVideoBitrate);
      setBitrateMode(value);
    } catch (error) {
      handleClientApplicationError(makeApplicationErrorMapper(t('errors.unknown'))(error));
    }
  };

  const handleCustomVideoBitrateChange = async (value: AdvancedSettingsCustomVideoBitrate) => {
    try {
      if (bitrateMode === ADVANCED_SETTINGS_BITRATE_MODE.custom) {
        await applyBitrate(publisher, bitrateMode, value);
      }
      setCustomVideoBitrate(value);
    } catch (error) {
      handleClientApplicationError(makeApplicationErrorMapper(t('errors.unknown'))(error));
    }
  };

  return {
    handleFrameRateChange,
    handleResolutionChange,
    handleBitrateModeChange,
    handleCustomVideoBitrateChange,
  };
};

export default useAdvancedSettingsVideoHandlers;
