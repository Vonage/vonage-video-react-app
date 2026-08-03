import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import usePublisherContext from '@hooks/usePublisherContext';
import advancedSettings$ from '@Context/AdvancedSettings';
import tryCatch from '@common/execution/tryCatch';
import { SelectField, SwitchField } from '@ui/components';
import { ADVANCED_SETTINGS_AUDIO_BITRATE_MODE } from '../../types/types';

const {
  setAudioBitrateMode,
  setCustomAudioBitrate,
  setEnableDtx,
  setPublisherAudioFallbackEnabled,
  setSubscriberAudioFallbackEnabled,
  setAdvancedNoiseSuppressionEnabled,
  setEchoCancellationEnabled,
  setNoiseSuppressionEnabled,
  setAutoGainControlEnabled,
} = advancedSettings$.actions;

const AdvancedSettingsAudioTab = (): ReactElement => {
  const { t } = useTranslation();
  const { publisher } = usePublisherContext();
  const { pathname } = useLocation();
  const isInWaitingRoom = pathname.startsWith('/waiting-room');
  const nextCallWarningKey = isInWaitingRoom
    ? 'advancedSettings.audio.nextCallWarningWaitingRoom'
    : 'advancedSettings.audio.nextCallWarningMeetingRoom';
  const audioBitrateMode = advancedSettings$.use.select(({ audioBitrateMode }) => audioBitrateMode);
  const customAudioBitrate = advancedSettings$.use.select(
    ({ customAudioBitrate }) => customAudioBitrate
  );
  const enableDtx = advancedSettings$.use.select(({ enableDtx }) => enableDtx);
  const publisherAudioFallbackEnabled = advancedSettings$.use.select(
    ({ publisherAudioFallbackEnabled }) => publisherAudioFallbackEnabled
  );
  const subscriberAudioFallbackEnabled = advancedSettings$.use.select(
    ({ subscriberAudioFallbackEnabled }) => subscriberAudioFallbackEnabled
  );
  const advancedNoiseSuppressionEnabled = advancedSettings$.use.select(
    ({ advancedNoiseSuppressionEnabled }) => advancedNoiseSuppressionEnabled
  );
  const echoCancellationEnabled = advancedSettings$.use.select(
    ({ echoCancellationEnabled }) => echoCancellationEnabled
  );
  const noiseSuppressionEnabled = advancedSettings$.use.select(
    ({ noiseSuppressionEnabled }) => noiseSuppressionEnabled
  );
  const autoGainControlEnabled = advancedSettings$.use.select(
    ({ autoGainControlEnabled }) => autoGainControlEnabled
  );

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

  /**
   * Advanced noise suppression is a media processor filter, so unlike the WebRTC constraints below
   * it can be applied to a running publisher. Same calls the in-call menu used before this setting
   * moved here.
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
    console.error('AdvancedSettingsAudioTab: failed to apply advanced noise suppression', error);

    setAdvancedNoiseSuppressionEnabled(!checked);
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-secondary">
        {t('advancedSettings.tabs.audio')}
      </h2>

      <p className="rounded-vera-medium border border-vera-warning bg-vera-warning/10 px-4 py-3 font-vera-plain text-vera-body-base text-vera-warning">
        {t(nextCallWarningKey)}
      </p>

      <div className="flex flex-col gap-4">
        <SelectField
          id="advanced-settings-audio-bitrate"
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

      <SwitchField
        id="advanced-settings-audio-advanced-noise-suppression"
        label={t('advancedSettings.audio.advancedNoiseSuppression.label')}
        checked={advancedNoiseSuppressionEnabled}
        onChange={handleAdvancedNoiseSuppressionChange}
        disabled={!hasMediaProcessorSupport('audio')}
        description={t('advancedSettings.audio.advancedNoiseSuppression.description')}
      />

      <SwitchField
        id="advanced-settings-audio-echo-cancellation"
        label={t('advancedSettings.audio.echoCancellation.label')}
        checked={echoCancellationEnabled}
        onChange={setEchoCancellationEnabled}
        description={t('advancedSettings.audio.echoCancellation.description')}
      />

      <SwitchField
        id="advanced-settings-audio-noise-suppression"
        label={t('advancedSettings.audio.noiseSuppression.label')}
        checked={noiseSuppressionEnabled}
        onChange={setNoiseSuppressionEnabled}
        description={t('advancedSettings.audio.noiseSuppression.description')}
      />

      <SwitchField
        id="advanced-settings-audio-auto-gain-control"
        label={t('advancedSettings.audio.autoGainControl.label')}
        checked={autoGainControlEnabled}
        onChange={setAutoGainControlEnabled}
        description={t('advancedSettings.audio.autoGainControl.description')}
      />

      <SwitchField
        id="advanced-settings-audio-enable-dtx"
        label={t('advancedSettings.audio.enableDtx.label')}
        checked={enableDtx}
        onChange={setEnableDtx}
        description={t('advancedSettings.audio.enableDtx.description')}
      />

      <SwitchField
        id="advanced-settings-audio-publisher-fallback"
        label={t('advancedSettings.audio.publisherAudioFallback.label')}
        checked={publisherAudioFallbackEnabled}
        onChange={setPublisherAudioFallbackEnabled}
        description={t('advancedSettings.audio.publisherAudioFallback.description')}
      />

      <SwitchField
        id="advanced-settings-audio-subscriber-fallback"
        label={t('advancedSettings.audio.subscriberAudioFallback.label')}
        checked={subscriberAudioFallbackEnabled}
        onChange={setSubscriberAudioFallbackEnabled}
        description={t('advancedSettings.audio.subscriberAudioFallback.description')}
      />
    </div>
  );
};

export default AdvancedSettingsAudioTab;
