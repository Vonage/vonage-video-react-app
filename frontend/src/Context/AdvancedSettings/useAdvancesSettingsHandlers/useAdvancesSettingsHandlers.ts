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
import tryCatch from '@common/execution/tryCatch';
import { t } from 'i18next';
import type {
  AdvancedSettingsBitrateMode,
  AdvancedSettingsCustomVideoBitrate,
  AdvancedSettingsFrameRate,
} from '@components/AdvancedSettingsDialog/types/types';
import { ADVANCED_SETTINGS_BITRATE_MODE } from '@components/AdvancedSettingsDialog/types/types';
import { Resolution } from '@common/types';

const {
  setBitrateMode,
  setCustomVideoBitrate,
  setFrameRate,
  setResolution,
  setAdvancedNoiseSuppressionEnabled,
} = advancedSettings$.actions;

type UseAdvancesSettingsHandlers = {
  handleFrameRateChange: (value: AdvancedSettingsFrameRate) => Promise<void>;
  handleResolutionChange: (value: Resolution) => Promise<void>;
  handleBitrateModeChange: (value: AdvancedSettingsBitrateMode) => Promise<void>;
  handleCustomVideoBitrateChange: (value: AdvancedSettingsCustomVideoBitrate) => Promise<void>;
  handleAdvancedNoiseSuppressionChange: (checked: boolean) => Promise<void>;
};

/**
 * Every advanced setting that has to reach the running publisher is applied from here, so the
 * dialog tabs only render and never talk to the publisher themselves.
 * @returns {UseAdvancesSettingsHandlers} the handlers for the advanced settings dialog
 */
const useAdvancesSettingsHandlers = (): UseAdvancesSettingsHandlers => {
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

  const handleResolutionChange = async (value: Resolution) => {
    try {
      await applyResolution(publisher, value);
      setResolution(value);
    } catch (error) {
      handleClientApplicationError(makeApplicationErrorMapper(t('errors.unknown'))(error));
    }
  };

  const handleBitrateModeChange = async (value: AdvancedSettingsBitrateMode) => {
    try {
      const { customVideoBitrate } = advancedSettings$.getState();

      await applyBitrate(publisher, value, customVideoBitrate);
      setBitrateMode(value);
    } catch (error) {
      handleClientApplicationError(makeApplicationErrorMapper(t('errors.unknown'))(error));
    }
  };

  const handleCustomVideoBitrateChange = async (value: AdvancedSettingsCustomVideoBitrate) => {
    try {
      const { bitrateMode } = advancedSettings$.getState();

      if (bitrateMode === ADVANCED_SETTINGS_BITRATE_MODE.custom) {
        await applyBitrate(publisher, bitrateMode, value);
      }
      setCustomVideoBitrate(value);
    } catch (error) {
      handleClientApplicationError(makeApplicationErrorMapper(t('errors.unknown'))(error));
    }
  };

  /**
   * Advanced noise suppression is a media processor filter, so unlike the WebRTC constraints it can
   * be applied to a running publisher.
   * @param {boolean} checked - the requested state
   */
  const handleAdvancedNoiseSuppressionChange = async (checked: boolean) => {
    setAdvancedNoiseSuppressionEnabled(checked);

    const { error } = await tryCatch(async () => {
      if (checked) return publisher?.applyAudioFilter({ type: 'advancedNoiseSuppression' });

      return publisher?.clearAudioFilter();
    });

    if (!error) return;

    // The filter never changed on the publisher, so keep the toggle honest about what is running.
    handleClientApplicationError(makeApplicationErrorMapper(t('errors.unknown'))(error));

    setAdvancedNoiseSuppressionEnabled(!checked);
  };

  return {
    handleFrameRateChange,
    handleResolutionChange,
    handleBitrateModeChange,
    handleCustomVideoBitrateChange,
    handleAdvancedNoiseSuppressionChange,
  };
};

export default useAdvancesSettingsHandlers;
