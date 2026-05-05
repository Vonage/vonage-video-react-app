import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import advancedSettings$ from '@Context/AdvancedSettings';
import { AdvancedSettingsBooleanField } from '../AdvancedSettingsBooleanField';
import { AdvancedSettingsSelectField } from '../AdvancedSettingsSelectField';
import { ADVANCED_SETTINGS_AUDIO_BITRATE_MODE } from '../types/types';

const {
  setAudioBitrateMode,
  setCustomAudioBitrate,
  setEnableDtx,
  setPublisherAudioFallbackEnabled,
  setSubscriberAudioFallbackEnabled,
} = advancedSettings$.actions;

const AdvancedSettingsAudioTab = (): ReactElement => {
  const { t } = useTranslation();
  const {
    audioBitrateMode,
    customAudioBitrate,
    enableDtx,
    publisherAudioFallbackEnabled,
    subscriberAudioFallbackEnabled,
  } = advancedSettings$.use.select((state) => ({
    audioBitrateMode: state.audioBitrateMode,
    customAudioBitrate: state.customAudioBitrate,
    enableDtx: state.enableDtx,
    publisherAudioFallbackEnabled: state.publisherAudioFallbackEnabled,
    subscriberAudioFallbackEnabled: state.subscriberAudioFallbackEnabled,
  }));

  const audioBitrateOptions = [
    {
      value: ADVANCED_SETTINGS_AUDIO_BITRATE_MODE.automatic,
      label: t('advancedSettings.audio.bitrate.options.automatic'),
    },
    {
      value: ADVANCED_SETTINGS_AUDIO_BITRATE_MODE.custom,
      label: t('advancedSettings.audio.bitrate.options.custom'),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-secondary">
        {t('advancedSettings.tabs.audio')}
      </h2>

      <div className="flex flex-col gap-4">
        <AdvancedSettingsSelectField
          label={t('advancedSettings.audio.bitrate.label')}
          value={audioBitrateMode}
          options={audioBitrateOptions}
          onChange={setAudioBitrateMode}
          description={t('advancedSettings.audio.bitrate.description')}
        />

        {audioBitrateMode === ADVANCED_SETTINGS_AUDIO_BITRATE_MODE.custom && (
          <div className="flex flex-col gap-3 rounded-vera-medium border-vera-border bg-vera-background px-4 py-3">
            <p className="font-vera-plain text-vera-body-base-semibold text-vera-secondary">
              {t('advancedSettings.audio.bitrate.customLabel')}
            </p>

            <div className="px-1">
              <input
                type="range"
                className="w-full accent-vera-primary"
                min={6}
                max={510}
                value={customAudioBitrate}
                onChange={(event) => {
                  setCustomAudioBitrate(Number(event.target.value));
                }}
                data-testid="advanced-settings-custom-audio-bitrate-slider"
                aria-label={t('advancedSettings.audio.bitrate.customLabel')}
              />
              <div className="mt-2 flex items-center justify-between font-vera-plain text-vera-caption text-vera-tertiary">
                <span>{t('advancedSettings.audio.bitrate.minimum')}</span>
                <span className="rounded-full bg-vera-surface px-1 py-1 text-vera-secondary">
                  {t('advancedSettings.audio.bitrate.currentValue', {
                    value: customAudioBitrate,
                  })}
                </span>
                <span>{t('advancedSettings.audio.bitrate.maximum')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <AdvancedSettingsBooleanField
        label={t('advancedSettings.audio.enableDtx.label')}
        checked={enableDtx}
        onChange={setEnableDtx}
        description={t('advancedSettings.audio.enableDtx.description')}
      />

      <AdvancedSettingsBooleanField
        label={t('advancedSettings.audio.publisherAudioFallback.label')}
        checked={publisherAudioFallbackEnabled}
        onChange={setPublisherAudioFallbackEnabled}
        description={t('advancedSettings.audio.publisherAudioFallback.description')}
      />

      <AdvancedSettingsBooleanField
        label={t('advancedSettings.audio.subscriberAudioFallback.label')}
        checked={subscriberAudioFallbackEnabled}
        onChange={setSubscriberAudioFallbackEnabled}
        description={t('advancedSettings.audio.subscriberAudioFallback.description')}
      />
    </div>
  );
};

export default AdvancedSettingsAudioTab;
