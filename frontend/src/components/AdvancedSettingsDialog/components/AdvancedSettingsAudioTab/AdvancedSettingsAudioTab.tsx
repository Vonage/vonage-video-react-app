import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import advancedSettings$ from '@Context/AdvancedSettings';
import useAdvancesSettingsHandlers from '@Context/AdvancedSettings/useAdvancesSettingsHandlers';
import { SelectField, Field } from '@ui/components';
import { ADVANCED_SETTINGS_AUDIO_BITRATE_MODE } from '../../types/types';

const {
  setAudioBitrateMode,
  setCustomAudioBitrate,
  setEnableDtx,
  setPublisherAudioFallbackEnabled,
  setSubscriberAudioFallbackEnabled,
  setEchoCancellationEnabled,
  setNoiseSuppressionEnabled,
  setAutoGainControlEnabled,
} = advancedSettings$.actions;

const AdvancedSettingsAudioTab = (): ReactElement => {
  const { t } = useTranslation();
  const { handleAdvancedNoiseSuppressionChange } = useAdvancesSettingsHandlers();
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

      <Field>
        <Field.Label htmlFor="advanced-settings-audio-advanced-noise-suppression">
          {t('advancedSettings.audio.advancedNoiseSuppression.label')}
        </Field.Label>
        <Field.Input
          variant="switch"
          id="advanced-settings-audio-advanced-noise-suppression"
          checked={advancedNoiseSuppressionEnabled}
          onChange={(event) => handleAdvancedNoiseSuppressionChange(event.currentTarget.checked)}
          disabled={!hasMediaProcessorSupport('audio')}
        />
        <Field.Description>
          {t('advancedSettings.audio.advancedNoiseSuppression.description')}
        </Field.Description>
      </Field>

      <Field>
        <Field.Label htmlFor="advanced-settings-audio-echo-cancellation">
          {t('advancedSettings.audio.echoCancellation.label')}
        </Field.Label>
        <Field.Input
          variant="switch"
          id="advanced-settings-audio-echo-cancellation"
          checked={echoCancellationEnabled}
          onChange={(event) => setEchoCancellationEnabled(event.currentTarget.checked)}
        />
        <Field.Description>
          {t('advancedSettings.audio.echoCancellation.description')}
        </Field.Description>
      </Field>

      <Field>
        <Field.Label htmlFor="advanced-settings-audio-noise-suppression">
          {t('advancedSettings.audio.noiseSuppression.label')}
        </Field.Label>
        <Field.Input
          variant="switch"
          id="advanced-settings-audio-noise-suppression"
          checked={noiseSuppressionEnabled}
          onChange={(event) => setNoiseSuppressionEnabled(event.currentTarget.checked)}
        />
        <Field.Description>
          {t('advancedSettings.audio.noiseSuppression.description')}
        </Field.Description>
      </Field>

      <Field>
        <Field.Label htmlFor="advanced-settings-audio-auto-gain-control">
          {t('advancedSettings.audio.autoGainControl.label')}
        </Field.Label>
        <Field.Input
          variant="switch"
          id="advanced-settings-audio-auto-gain-control"
          checked={autoGainControlEnabled}
          onChange={(event) => setAutoGainControlEnabled(event.currentTarget.checked)}
        />
        <Field.Description>
          {t('advancedSettings.audio.autoGainControl.description')}
        </Field.Description>
      </Field>

      <Field>
        <Field.Label htmlFor="advanced-settings-audio-enable-dtx">
          {t('advancedSettings.audio.enableDtx.label')}
        </Field.Label>
        <Field.Input
          variant="switch"
          id="advanced-settings-audio-enable-dtx"
          checked={enableDtx}
          onChange={(event) => setEnableDtx(event.currentTarget.checked)}
        />
        <Field.Description>{t('advancedSettings.audio.enableDtx.description')}</Field.Description>
      </Field>

      <Field>
        <Field.Label htmlFor="advanced-settings-audio-publisher-fallback">
          {t('advancedSettings.audio.publisherAudioFallback.label')}
        </Field.Label>
        <Field.Input
          variant="switch"
          id="advanced-settings-audio-publisher-fallback"
          checked={publisherAudioFallbackEnabled}
          onChange={(event) => setPublisherAudioFallbackEnabled(event.currentTarget.checked)}
        />
        <Field.Description>
          {t('advancedSettings.audio.publisherAudioFallback.description')}
        </Field.Description>
      </Field>

      <Field>
        <Field.Label htmlFor="advanced-settings-audio-subscriber-fallback">
          {t('advancedSettings.audio.subscriberAudioFallback.label')}
        </Field.Label>
        <Field.Input
          variant="switch"
          id="advanced-settings-audio-subscriber-fallback"
          checked={subscriberAudioFallbackEnabled}
          onChange={(event) => setSubscriberAudioFallbackEnabled(event.currentTarget.checked)}
        />
        <Field.Description>
          {t('advancedSettings.audio.subscriberAudioFallback.description')}
        </Field.Description>
      </Field>
    </div>
  );
};

export default AdvancedSettingsAudioTab;
