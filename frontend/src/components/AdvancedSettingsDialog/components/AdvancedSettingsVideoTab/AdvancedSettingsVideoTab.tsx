import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { env } from '../../../../env';
import advancedSettings$ from '@Context/AdvancedSettings';
import { Field, SelectField, SettingsSection, VividIcon } from '@ui';
import { AdvancedSettingsCodecPriorityField } from '../AdvancedSettingsCodecPriorityField';
import { AdvancedSettingsCustomVideoBitrateField } from '../AdvancedSettingsCustomVideoBitrateField';
import type {
  AdvancedSettingsContentHint,
  AdvancedSettingsFrameRate,
  AdvancedSettingsSelectOption,
} from '../../types/types';
import {
  ADVANCED_SETTINGS_BITRATE_MODE,
  ADVANCED_SETTINGS_CODEC_MODE,
  ADVANCED_SETTINGS_CONTENT_HINT,
} from '../../types/types';
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
  const cameraContentHint = advancedSettings$.use.select(
    ({ cameraContentHint }) => cameraContentHint
  );

  const {
    handleFrameRateChange,
    handleResolutionChange,
    handleBitrateModeChange,
    handleCustomVideoBitrateChange,
    handleCameraContentHintChange,
  } = useAdvancesSettingsHandlers();

  const contentHintOptionLabels: Record<AdvancedSettingsContentHint, string> = {
    '': t('advancedSettings.video.contentHint.options.automatic'),
    motion: t('advancedSettings.video.contentHint.options.motion'),
    detail: t('advancedSettings.video.contentHint.options.detail'),
    text: t('advancedSettings.video.contentHint.options.text'),
  };

  const toContentHintOptions = (
    hints: AdvancedSettingsContentHint[]
  ): AdvancedSettingsSelectOption<AdvancedSettingsContentHint>[] =>
    hints.map((hint) => ({ value: hint, label: contentHintOptionLabels[hint] }));

  const cameraContentHintOptions = toContentHintOptions([
    ADVANCED_SETTINGS_CONTENT_HINT.automatic,
    ADVANCED_SETTINGS_CONTENT_HINT.motion,
    ADVANCED_SETTINGS_CONTENT_HINT.detail,
  ]);

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
        <Field>
          <Field.Label htmlFor="advanced-settings-video-self-view-mirroring">
            {t('advancedSettings.video.selfViewMirroring.label')}
          </Field.Label>
          <Field.Input
            variant="switch"
            id="advanced-settings-video-self-view-mirroring"
            data-testid="advanced-settings-video-self-view-mirroring"
            checked={selfViewMirroringEnabled}
            onChange={(event) => setSelfViewMirroringEnabled(event.currentTarget.checked)}
          />
          <Field.Description>
            {t('advancedSettings.video.selfViewMirroring.description')}
          </Field.Description>
        </Field>

        <SelectField
          id="advanced-settings-video-bitrate"
          data-testid="advanced-settings-video-camera-bitrate"
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
          data-testid="advanced-settings-video-camera-codec"
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
          data-testid="advanced-settings-video-camera-frame-rate"
          label={t('advancedSettings.video.frameRate.label')}
          value={frameRate}
          options={frameRateOptions}
          onChange={handleFrameRateChange}
        />

        <SelectField
          id="advanced-settings-video-resolution"
          data-testid="advanced-settings-video-camera-resolution"
          label={t('advancedSettings.video.resolution.label')}
          value={resolution}
          options={resolutionOptions}
          onChange={handleResolutionChange}
        />

        <SelectField
          id="advanced-settings-video-camera-content-hint"
          data-testid="advanced-settings-video-camera-content-hint"
          label={t('advancedSettings.video.contentHint.label')}
          value={cameraContentHint}
          options={cameraContentHintOptions}
          onChange={handleCameraContentHintChange}
          description={t('advancedSettings.video.contentHint.description')}
        />

        <Field>
          <Field.Label htmlFor="advanced-settings-video-stats-overlay">
            {t('advancedSettings.video.statsOverlay.label')}
          </Field.Label>
          <Field.Input
            variant="switch"
            id="advanced-settings-video-stats-overlay"
            data-testid="advanced-settings-video-stats-overlay"
            checked={videoStatsOverlayEnabled}
            onChange={(event) => setVideoStatsOverlayEnabled(event.currentTarget.checked)}
          />
          <Field.Description>
            {t('advancedSettings.video.statsOverlay.description')}
          </Field.Description>
        </Field>
      </SettingsSection>
    </div>
  );
};

export default AdvancedSettingsVideoTab;
