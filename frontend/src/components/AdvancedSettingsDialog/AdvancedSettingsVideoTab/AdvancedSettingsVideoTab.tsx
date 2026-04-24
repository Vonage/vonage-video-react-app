import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { env, RESOLUTIONS } from '../../../env';
import advancedSettingsDialog$ from '@Context/AdvancedSettingsDialog';
import { AdvancedSettingsCodecPriorityField } from '../AdvancedSettingsCodecPriorityField';
import { AdvancedSettingsCustomVideoBitrateField } from '../AdvancedSettingsCustomVideoBitrateField';
import { AdvancedSettingsSelectField } from '../AdvancedSettingsSelectField';
import type {
  AdvancedSettingsFrameRate,
  AdvancedSettingsResolution,
  AdvancedSettingsSelectOption,
} from '../types/types';
import { ADVANCED_SETTINGS_BITRATE_MODE, ADVANCED_SETTINGS_CODEC_MODE } from '../types/types';

const AdvancedSettingsVideoTab = (): ReactElement => {
  const { t } = useTranslation();
  const { bitrateMode, codecMode, codecPriority, frameRate, resolution } =
    advancedSettingsDialog$.use.select((state) => ({
      bitrateMode: state.bitrateMode,
      codecMode: state.codecMode,
      codecPriority: state.codecPriority,
      frameRate: state.frameRate,
      resolution: state.resolution,
    }));
  const { setBitrateMode, setCodecMode, setCodecPriority, setFrameRate, setResolution } =
    advancedSettingsDialog$.use.actions();

  const bitrateOptions = [
    {
      value: ADVANCED_SETTINGS_BITRATE_MODE.default,
      label: t('advancedSettings.video.bitrate.options.default'),
    },
    {
      value: ADVANCED_SETTINGS_BITRATE_MODE.bwSaver,
      label: t('advancedSettings.video.bitrate.options.bw_saver'),
    },
    {
      value: ADVANCED_SETTINGS_BITRATE_MODE.extraBwSaver,
      label: t('advancedSettings.video.bitrate.options.extra_bw_saver'),
    },
    {
      value: ADVANCED_SETTINGS_BITRATE_MODE.custom,
      label: t('advancedSettings.video.bitrate.options.custom'),
    },
  ];

  const codecOptions = [
    {
      value: ADVANCED_SETTINGS_CODEC_MODE.automatic,
      label: t('advancedSettings.video.codec.options.automatic'),
    },
    {
      value: ADVANCED_SETTINGS_CODEC_MODE.manual,
      label: t('advancedSettings.video.codec.options.manual'),
    },
  ];

  const frameRateOptions: AdvancedSettingsSelectOption<AdvancedSettingsFrameRate>[] = (
    env.SUPPORTED_FRAME_RATES as AdvancedSettingsFrameRate[]
  ).map((supportedFrameRate) => ({
    value: supportedFrameRate,
    label: t(`advancedSettings.video.frameRate.options.${supportedFrameRate}`),
  }));

  const resolutionOptions: AdvancedSettingsSelectOption<AdvancedSettingsResolution>[] =
    RESOLUTIONS.map((supportedResolution) => ({
      value: supportedResolution,
      label: t(`advancedSettings.video.resolution.options.${supportedResolution}`),
    }));

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-secondary">
        {t('advancedSettings.tabs.video')}
      </h2>

      <div className="flex flex-col gap-6">
        <AdvancedSettingsSelectField
          label={t('advancedSettings.video.bitrate.label')}
          value={bitrateMode}
          options={bitrateOptions}
          onChange={setBitrateMode}
          description={t('advancedSettings.video.bitrate.description')}
        />

        {bitrateMode === ADVANCED_SETTINGS_BITRATE_MODE.custom && (
          <AdvancedSettingsCustomVideoBitrateField />
        )}

        <AdvancedSettingsSelectField
          label={t('advancedSettings.video.codec.label')}
          value={codecMode}
          options={codecOptions}
          onChange={setCodecMode}
          description={t('advancedSettings.video.codec.description')}
        />

        {codecMode === ADVANCED_SETTINGS_CODEC_MODE.manual && (
          <AdvancedSettingsCodecPriorityField
            codecPriority={codecPriority}
            setCodecPriority={setCodecPriority}
          />
        )}

        <AdvancedSettingsSelectField
          label={t('advancedSettings.video.frameRate.label')}
          value={frameRate}
          options={frameRateOptions}
          onChange={setFrameRate}
        />

        <AdvancedSettingsSelectField
          label={t('advancedSettings.video.resolution.label')}
          value={resolution}
          options={resolutionOptions}
          onChange={setResolution}
        />
      </div>
    </div>
  );
};

export default AdvancedSettingsVideoTab;
