import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import advancedSettings$ from '@Context/AdvancedSettings';
import { Field, SelectField } from '@ui';
import { AdvancedSettingsCodecPriorityField } from '../AdvancedSettingsCodecPriorityField';
import { AdvancedSettingsCustomVideoBitrateField } from '../AdvancedSettingsCustomVideoBitrateField';
import type {
  AdvancedSettingsBitrateMode,
  AdvancedSettingsContentHint,
  AdvancedSettingsFrameRate,
  AdvancedSettingsSelectOption,
} from '../../types/types';
import {
  ADVANCED_SETTINGS_BITRATE_MODE,
  ADVANCED_SETTINGS_CODEC_MODE,
  ADVANCED_SETTINGS_CONTENT_HINT,
  ADVANCED_SETTINGS_SCREEN_SHARE_CODEC_MODE,
} from '../../types/types';
import { Resolution } from '@common/types';
import { env } from '../../../../env';
import useAdvancesSettingsHandlers from '@Context/AdvancedSettings/useAdvancesSettingsHandlers';

const DEFAULT_OPTION_VALUE = 'default-sdk';

const { setScreenShareCodecMode, setScreenShareCodecPriority, setScalableScreenshareEnabled } =
  advancedSettings$.actions;

const AdvancedSettingsScreenSharingTab = (): ReactElement => {
  const { t } = useTranslation();
  const screenShareContentHint = advancedSettings$.use.select(
    ({ screenShareContentHint }) => screenShareContentHint
  );
  const screenShareCodecMode = advancedSettings$.use.select(
    ({ screenShareCodecMode }) => screenShareCodecMode
  );
  const screenShareCodecPriority = advancedSettings$.use.select(
    ({ screenShareCodecPriority }) => screenShareCodecPriority
  );
  const scalableScreenshareEnabled = advancedSettings$.use.select(
    ({ scalableScreenshareEnabled }) => scalableScreenshareEnabled
  );
  const screenShareFrameRate = advancedSettings$.use.select(
    ({ screenShareFrameRate }) => screenShareFrameRate
  );
  const screenShareResolution = advancedSettings$.use.select(
    ({ screenShareResolution }) => screenShareResolution
  );
  const screenShareBitrateMode = advancedSettings$.use.select(
    ({ screenShareBitrateMode }) => screenShareBitrateMode
  );
  const screenShareCustomVideoBitrate = advancedSettings$.use.select(
    ({ screenShareCustomVideoBitrate }) => screenShareCustomVideoBitrate
  );
  const {
    handleScreenShareContentHintChange,
    handleScreenShareFrameRateChange,
    handleScreenShareResolutionChange,
    handleScreenShareBitrateModeChange,
    handleScreenShareCustomVideoBitrateChange,
  } = useAdvancesSettingsHandlers();

  const contentHintOptionLabels: Record<AdvancedSettingsContentHint, string> = {
    '': t('advancedSettings.video.contentHint.options.automatic'),
    motion: t('advancedSettings.video.contentHint.options.motion'),
    detail: t('advancedSettings.video.contentHint.options.detail'),
    text: t('advancedSettings.video.contentHint.options.text'),
  };
  const screenShareContentHintOptions: AdvancedSettingsSelectOption<AdvancedSettingsContentHint>[] =
    [
      ADVANCED_SETTINGS_CONTENT_HINT.automatic,
      ADVANCED_SETTINGS_CONTENT_HINT.motion,
      ADVANCED_SETTINGS_CONTENT_HINT.detail,
      ADVANCED_SETTINGS_CONTENT_HINT.text,
    ].map((value) => ({ value, label: contentHintOptionLabels[value] }));
  const defaultOption = {
    value: DEFAULT_OPTION_VALUE,
    label: t('advancedSettings.video.screenShare.useDefault'),
  };
  const frameRateOptions = [
    defaultOption,
    ...(env.SUPPORTED_FRAME_RATES as AdvancedSettingsFrameRate[]).map((value) => ({
      value: String(value),
      label: t(`advancedSettings.video.frameRate.options.${value}`),
    })),
  ];
  const resolutionOptions = [
    defaultOption,
    ...Object.values(Resolution).map((value) => ({ value, label: value })),
  ];
  const bitrateOptions = [
    defaultOption,
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
      value: ADVANCED_SETTINGS_SCREEN_SHARE_CODEC_MODE.inherit,
      label: t('advancedSettings.video.screenShareCodec.options.inherit'),
    },
    {
      value: ADVANCED_SETTINGS_CODEC_MODE.automatic,
      label: t('advancedSettings.video.codec.options.automatic'),
    },
    {
      value: ADVANCED_SETTINGS_CODEC_MODE.manual,
      label: t('advancedSettings.video.codec.options.manual'),
    },
  ];

  return (
    <div className="flex flex-col gap-6" data-testid="advanced-settings-screen-sharing-tab">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-secondary">
        {t('advancedSettings.tabs.screenSharing')}
      </h2>
      <p className="font-vera-plain text-vera-body-base text-vera-tertiary">
        {t('advancedSettings.video.sections.screenSharing.description')}
      </p>
      <SelectField
        id="advanced-settings-video-screen-share-content-hint"
        data-testid="advanced-settings-video-screen-share-content-hint"
        label={t('advancedSettings.video.contentHint.label')}
        value={screenShareContentHint}
        options={screenShareContentHintOptions}
        onChange={handleScreenShareContentHintChange}
        description={t('advancedSettings.video.contentHint.description')}
      />
      <SelectField
        id="advanced-settings-video-screen-share-codec"
        data-testid="advanced-settings-video-screen-share-codec"
        label={t('advancedSettings.video.codec.label')}
        value={screenShareCodecMode}
        options={codecOptions}
        onChange={setScreenShareCodecMode}
        description={t('advancedSettings.video.screenShareCodec.description')}
      />
      {screenShareCodecMode === ADVANCED_SETTINGS_SCREEN_SHARE_CODEC_MODE.manual && (
        <AdvancedSettingsCodecPriorityField
          codecPriority={screenShareCodecPriority}
          setCodecPriority={setScreenShareCodecPriority}
          idPrefix="advanced-settings-screen-share-codec-priority"
        />
      )}
      <SelectField
        id="advanced-settings-video-screen-share-frame-rate"
        data-testid="advanced-settings-video-screen-share-frame-rate"
        label={t('advancedSettings.video.frameRate.label')}
        value={String(screenShareFrameRate ?? DEFAULT_OPTION_VALUE)}
        options={frameRateOptions}
        onChange={(value) =>
          void handleScreenShareFrameRateChange(
            value === DEFAULT_OPTION_VALUE ? null : (Number(value) as AdvancedSettingsFrameRate)
          )
        }
      />
      <SelectField
        id="advanced-settings-video-screen-share-resolution"
        data-testid="advanced-settings-video-screen-share-resolution"
        label={t('advancedSettings.video.resolution.label')}
        value={String(screenShareResolution ?? DEFAULT_OPTION_VALUE)}
        options={resolutionOptions}
        onChange={(value) =>
          void handleScreenShareResolutionChange(
            value === DEFAULT_OPTION_VALUE ? null : (value as Resolution)
          )
        }
      />
      <SelectField
        id="advanced-settings-video-screen-share-bitrate"
        data-testid="advanced-settings-video-screen-share-bitrate"
        label={t('advancedSettings.video.bitrate.label')}
        value={String(screenShareBitrateMode ?? DEFAULT_OPTION_VALUE)}
        options={bitrateOptions}
        onChange={(value) =>
          void handleScreenShareBitrateModeChange(
            value === DEFAULT_OPTION_VALUE ? null : (value as AdvancedSettingsBitrateMode)
          )
        }
      />
      {screenShareBitrateMode === ADVANCED_SETTINGS_BITRATE_MODE.custom && (
        <AdvancedSettingsCustomVideoBitrateField
          onChange={handleScreenShareCustomVideoBitrateChange}
          value={screenShareCustomVideoBitrate}
          idPrefix="advanced-settings-screen-share-custom-video-bitrate"
        />
      )}
      <Field>
        <Field.Label htmlFor="advanced-settings-video-scalable-screenshare">
          {t('advancedSettings.video.scalableScreenshare.label')}
        </Field.Label>
        <Field.Input
          variant="switch"
          id="advanced-settings-video-scalable-screenshare"
          data-testid="advanced-settings-video-scalable-screenshare"
          checked={scalableScreenshareEnabled}
          onChange={(event) => setScalableScreenshareEnabled(event.currentTarget.checked)}
        />
        <Field.Description>
          {t('advancedSettings.video.scalableScreenshare.description')}
        </Field.Description>
      </Field>
    </div>
  );
};

export default AdvancedSettingsScreenSharingTab;
