import usePublisherContext from '@hooks/usePublisherContext';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import useScreenShareContext from '@hooks/useScreenShareContext';
import advancedSettings$ from '@Context/AdvancedSettings';
import { makeApplicationErrorMapper } from '@core/errors';
import { handleClientApplicationError } from '@ui/helpers';
import {
  applyFrameRate,
  applyResolution,
  applyBitrate,
  applyContentHint,
} from '@Context/PublisherProvider/useApplyAdvancedSettings';
import { t } from 'i18next';
import type {
  AdvancedSettingsBitrateMode,
  AdvancedSettingsContentHint,
  AdvancedSettingsCustomVideoBitrate,
  AdvancedSettingsFrameRate,
} from '../../types/types';
import { ADVANCED_SETTINGS_BITRATE_MODE } from '../../types/types';
import { Resolution } from '@common/types';

const {
  setBitrateMode,
  setCustomVideoBitrate,
  setFrameRate,
  setResolution,
  setCameraContentHint,
  setScreenShareContentHint,
} = advancedSettings$.actions;

type UseAdvancedSettingsVideoHandlersArgs = {
  bitrateMode: AdvancedSettingsBitrateMode;
  customVideoBitrate: AdvancedSettingsCustomVideoBitrate;
};

type UseAdvancedSettingsVideoHandlers = {
  handleFrameRateChange: (value: AdvancedSettingsFrameRate) => Promise<void>;
  handleResolutionChange: (value: Resolution) => Promise<void>;
  handleBitrateModeChange: (value: AdvancedSettingsBitrateMode) => Promise<void>;
  handleCustomVideoBitrateChange: (value: AdvancedSettingsCustomVideoBitrate) => Promise<void>;
  handleCameraContentHintChange: (value: AdvancedSettingsContentHint) => void;
  handleScreenShareContentHintChange: (value: AdvancedSettingsContentHint) => void;
};

const useAdvancedSettingsVideoHandlers = ({
  bitrateMode,
  customVideoBitrate,
}: UseAdvancedSettingsVideoHandlersArgs): UseAdvancedSettingsVideoHandlers => {
  const { publisher: meetingRoomPublisher } = usePublisherContext();
  const { publisher: previewPublisher } = usePreviewPublisherContext();
  const { screensharingPublisher } = useScreenShareContext();
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
      await applyBitrate(publisher, value, customVideoBitrate);
      setBitrateMode(value);
    } catch (error) {
      handleClientApplicationError(makeApplicationErrorMapper(t('errors.unknown'))(error));
    }
  };

  const handleCameraContentHintChange = (value: AdvancedSettingsContentHint) => {
    try {
      applyContentHint(publisher, value);
      setCameraContentHint(value);
    } catch (error) {
      handleClientApplicationError(makeApplicationErrorMapper(t('errors.unknown'))(error));
    }
  };

  /**
   * The screen-share publisher only exists while a share is running, and only inside the meeting
   * room. When it is absent the setting is stored and picked up by the next initPublisher call.
   */
  const handleScreenShareContentHintChange = (value: AdvancedSettingsContentHint) => {
    try {
      applyContentHint(screensharingPublisher ?? null, value);
      setScreenShareContentHint(value);
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
    handleCameraContentHintChange,
    handleScreenShareContentHintChange,
  };
};

export default useAdvancedSettingsVideoHandlers;
