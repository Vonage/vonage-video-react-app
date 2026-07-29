import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { env } from '../../../../env';
import advancedSettings$ from '@Context/AdvancedSettings';
import { SelectField, SettingsSection, SwitchField, VividIcon } from '@ui';
import { AdvancedSettingsCodecPriorityField } from '../AdvancedSettingsCodecPriorityField';
import { AdvancedSettingsCustomVideoBitrateField } from '../AdvancedSettingsCustomVideoBitrateField';
import type { AdvancedSettingsFrameRate, AdvancedSettingsSelectOption } from '../../types/types';
import { ADVANCED_SETTINGS_BITRATE_MODE, ADVANCED_SETTINGS_CODEC_MODE } from '../../types/types';
import useAdvancesSettingsHandlers from '@Context/AdvancedSettings/useAdvancesSettingsHandlers';
import { Resolution } from '@common/types';

const { setCodecMode, setCodecPriority, setSelfViewMirroringEnabled, setVideoStatsOverlayEnabled } =
  advancedSettings$.actions;

const resolutionOptions: AdvancedSettingsSelectOption<Resolution>[] = Object.values(Resolution).map(
  (value) => ({
    value: value,
    label: value,
  })
);

const AdvancedSettingsVideoTab = (): ReactElement => {
  const { t } = useTranslation();
  const bitrateMode = advancedSettings$.use.select(({ bitrateMode }) => bitrateMode);
  const codecMode = advancedSettings$.use.select(({ codecMode }) => codecMode);
  const codecPriority = advancedSettings$.use.select(({ codecPriority }) => codecPriority);
  const frameRate = advancedSettings$.use.select(({ frameRate }) => frameRate);
  const resolution = advancedSettings$.use.select(({ resolution }) => resolution);
  const selfViewMirroringEnabled = advancedSettings$.use.select(
    ({ selfViewMirroringEnabled }) => selfViewMirroringEnabled
  );
  const videoStatsOverlayEnabled = advancedSettings$.use.select(
    ({ videoStatsOverlayEnabled }) => videoStatsOverlayEnabled
  );
  const {
    handleFrameRateChange,
    handleResolutionChange,
    handleBitrateModeChange,
    handleCustomVideoBitrateChange,
  } = useAdvancesSettingsHandlers();

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

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-secondary">
        {t('advancedSettings.tabs.video')}
      </h2>

      <SettingsSection
        title={t('advancedSettings.video.sections.camera.label')}
        icon={<VividIcon name="video-solid" customSize={-5} />}
        data-testid="advanced-settings-video-camera-section"
      >
        <SwitchField
          id="advanced-settings-video-self-view-mirroring"
          label={t('advancedSettings.video.selfViewMirroring.label')}
          checked={selfViewMirroringEnabled}
          onChange={setSelfViewMirroringEnabled}
          description={t('advancedSettings.video.selfViewMirroring.description')}
        />

        <SelectField
          id="advanced-settings-video-bitrate"
          label={t('advancedSettings.video.bitrate.label')}
          value={bitrateMode}
          options={bitrateOptions}
          onChange={handleBitrateModeChange}
          description={t('advancedSettings.video.bitrate.description')}
        />

        {bitrateMode === ADVANCED_SETTINGS_BITRATE_MODE.custom && (
          <AdvancedSettingsCustomVideoBitrateField onChange={handleCustomVideoBitrateChange} />
        )}

        <SelectField
          id="advanced-settings-video-codec"
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

        <SelectField
          id="advanced-settings-video-frame-rate"
          label={t('advancedSettings.video.frameRate.label')}
          value={frameRate}
          options={frameRateOptions}
          onChange={handleFrameRateChange}
        />

        <SelectField
          id="advanced-settings-video-resolution"
          label={t('advancedSettings.video.resolution.label')}
          value={resolution}
          options={resolutionOptions}
          onChange={handleResolutionChange}
        />

        <SwitchField
          id="advanced-settings-video-stats-overlay"
          label={t('advancedSettings.video.statsOverlay.label')}
          checked={videoStatsOverlayEnabled}
          onChange={setVideoStatsOverlayEnabled}
          description={t('advancedSettings.video.statsOverlay.description')}
        />
      </SettingsSection>

      <SettingsSection
        title={t('advancedSettings.video.sections.screenSharing.label')}
        icon={<VividIcon name="screen-share-solid" customSize={-5} />}
        description={t('advancedSettings.video.sections.screenSharing.description')}
        data-testid="advanced-settings-video-screen-sharing-section"
      />
    </div>
  );
};

export default AdvancedSettingsVideoTab;
