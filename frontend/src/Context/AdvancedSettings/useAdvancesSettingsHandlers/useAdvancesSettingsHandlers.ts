import usePublisherContext from '@hooks/usePublisherContext';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import advancedSettings$ from '@Context/AdvancedSettings';
import { useContext } from 'react';
import screenShare$ from '@Context/screenShare';
import { makeApplicationErrorMapper } from '@core/errors';
import { handleClientApplicationError } from '@ui/helpers';
import {
  applyFrameRate,
  applyResolution,
  applyBitrate,
  applyContentHint,
} from '@Context/PublisherProvider/useApplyAdvancedSettings';
import tryCatch from '@common/execution/tryCatch';
import { t } from 'i18next';
import type {
  AdvancedSettingsBitrateMode,
  AdvancedSettingsContentHint,
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
  setCameraContentHint,
  setScreenShareContentHint,
  setScreenShareFrameRate,
  setScreenShareResolution,
  setScreenShareBitrateMode,
  setScreenShareCustomVideoBitrate,
} = advancedSettings$.actions;

type UseAdvancesSettingsHandlers = {
  handleFrameRateChange: (value: AdvancedSettingsFrameRate) => Promise<void>;
  handleResolutionChange: (value: Resolution) => Promise<void>;
  handleBitrateModeChange: (value: AdvancedSettingsBitrateMode) => Promise<void>;
  handleCustomVideoBitrateChange: (value: AdvancedSettingsCustomVideoBitrate) => Promise<void>;
  handleAdvancedNoiseSuppressionChange: (checked: boolean) => Promise<void>;
  handleCameraContentHintChange: (value: AdvancedSettingsContentHint) => Promise<void>;
  handleScreenShareContentHintChange: (value: AdvancedSettingsContentHint) => Promise<void>;
  handleScreenShareFrameRateChange: (value: AdvancedSettingsFrameRate | null) => Promise<void>;
  handleScreenShareResolutionChange: (value: Resolution | null) => Promise<void>;
  handleScreenShareBitrateModeChange: (value: AdvancedSettingsBitrateMode | null) => Promise<void>;
  handleScreenShareCustomVideoBitrateChange: (
    value: AdvancedSettingsCustomVideoBitrate
  ) => Promise<void>;
};

/**
 * Every advanced setting that has to reach the running publisher is applied from here, so the
 * dialog tabs only render and never talk to the publisher themselves.
 * @returns {UseAdvancesSettingsHandlers} the handlers for the advanced settings dialog
 */
const useAdvancesSettingsHandlers = (): UseAdvancesSettingsHandlers => {
  const { publisher: meetingRoomPublisher } = usePublisherContext();
  const { publisher: previewPublisher } = usePreviewPublisherContext();
  const screenShare = useContext(screenShare$.Context) as ReturnType<
    typeof screenShare$.use.api
  > | null;
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

  const handleCameraContentHintChange = async (value: AdvancedSettingsContentHint) => {
    try {
      await applyContentHint(publisher, value);
      setCameraContentHint(value);
    } catch (error) {
      handleClientApplicationError(makeApplicationErrorMapper(t('errors.unknown'))(error));
    }
  };

  const handleScreenShareContentHintChange = async (value: AdvancedSettingsContentHint) => {
    try {
      await applyContentHint(screenShare?.getState().publisher ?? null, value);
      setScreenShareContentHint(value);
    } catch (error) {
      handleClientApplicationError(makeApplicationErrorMapper(t('errors.unknown'))(error));
    }
  };

  const handleScreenShareFrameRateChange = async (value: AdvancedSettingsFrameRate | null) => {
    try {
      if (value !== null) await applyFrameRate(screenShare?.getState().publisher ?? null, value);
      setScreenShareFrameRate(value);
    } catch (error) {
      handleClientApplicationError(makeApplicationErrorMapper(t('errors.unknown'))(error));
    }
  };

  const handleScreenShareResolutionChange = async (value: Resolution | null) => {
    try {
      if (value !== null) await applyResolution(screenShare?.getState().publisher ?? null, value);
      setScreenShareResolution(value);
    } catch (error) {
      handleClientApplicationError(makeApplicationErrorMapper(t('errors.unknown'))(error));
    }
  };

  const handleScreenShareBitrateModeChange = async (value: AdvancedSettingsBitrateMode | null) => {
    try {
      const { screenShareCustomVideoBitrate } = advancedSettings$.getState();

      if (value !== null) {
        await applyBitrate(
          screenShare?.getState().publisher ?? null,
          value,
          screenShareCustomVideoBitrate
        );
      }
      setScreenShareBitrateMode(value);
    } catch (error) {
      handleClientApplicationError(makeApplicationErrorMapper(t('errors.unknown'))(error));
    }
  };

  const handleScreenShareCustomVideoBitrateChange = async (
    value: AdvancedSettingsCustomVideoBitrate
  ) => {
    try {
      const { screenShareBitrateMode } = advancedSettings$.getState();

      if (screenShareBitrateMode === ADVANCED_SETTINGS_BITRATE_MODE.custom) {
        await applyBitrate(
          screenShare?.getState().publisher ?? null,
          screenShareBitrateMode,
          value
        );
      }
      setScreenShareCustomVideoBitrate(value);
    } catch (error) {
      handleClientApplicationError(makeApplicationErrorMapper(t('errors.unknown'))(error));
    }
  };

  return {
    handleFrameRateChange,
    handleResolutionChange,
    handleBitrateModeChange,
    handleCustomVideoBitrateChange,
    handleAdvancedNoiseSuppressionChange,
    handleCameraContentHintChange,
    handleScreenShareContentHintChange,
    handleScreenShareFrameRateChange,
    handleScreenShareResolutionChange,
    handleScreenShareBitrateModeChange,
    handleScreenShareCustomVideoBitrateChange,
  };
};

export default useAdvancesSettingsHandlers;
