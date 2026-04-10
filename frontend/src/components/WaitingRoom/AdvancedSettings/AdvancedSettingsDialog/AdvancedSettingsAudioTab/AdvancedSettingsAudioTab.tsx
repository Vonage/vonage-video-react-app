import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import AdvancedSettingsBooleanField from '../AdvancedSettingsBooleanField';
import type { AdvancedSettingsAudioBitrate } from '../AdvancedSettingsDialog.types';

type AdvancedSettingsAudioTabProps = {
  audioBitrate: AdvancedSettingsAudioBitrate;
  setAudioBitrate: (value: AdvancedSettingsAudioBitrate) => void;
  publisherAudioFallbackEnabled: boolean;
  setPublisherAudioFallbackEnabled: (value: boolean) => void;
  subscriberAudioFallbackEnabled: boolean;
  setSubscriberAudioFallbackEnabled: (value: boolean) => void;
};

const AdvancedSettingsAudioTab = ({
  audioBitrate,
  setAudioBitrate,
  publisherAudioFallbackEnabled,
  setPublisherAudioFallbackEnabled,
  subscriberAudioFallbackEnabled,
  setSubscriberAudioFallbackEnabled,
}: AdvancedSettingsAudioTabProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-secondary">
        {t('advancedSettings.tabs.audio')}
      </h2>

      <div className="flex flex-col gap-1.5">
        <h3 className="font-vera-plain text-vera-body-extended-semibold text-vera-secondary">
          {t('advancedSettings.audio.bitrate.label')}
        </h3>

        <div className="px-1">
          <input
            type="range"
            className="w-full accent-vera-primary"
            min={6}
            max={510}
            value={audioBitrate}
            onChange={(event) => {
              setAudioBitrate(Number(event.target.value));
            }}
          />
          <div className="mt-2 flex items-center justify-between font-vera-plain text-vera-caption text-vera-tertiary">
            <span>6 kbps</span>
            <span className="rounded-full bg-vera-background px-1 py-1 text-vera-secondary">
              {audioBitrate} kbps
            </span>
            <span>510 kbps</span>
          </div>
        </div>

        <p className="font-vera-plain text-vera-body-base text-vera-tertiary">
          {t('advancedSettings.audio.bitrate.description')}
        </p>
      </div>

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
