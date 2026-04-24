import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { env } from '../../../env';
import advancedSettingsDialog$ from '@Context/AdvancedSettingsDialog';

const CUSTOM_VIDEO_BITRATE_STEP_BPS = 5_000;

const AdvancedSettingsCustomVideoBitrateField = (): ReactElement => {
  const { t } = useTranslation();
  const customVideoBitrate = advancedSettingsDialog$.use.select(
    (state) => state.customVideoBitrate
  );
  const { setCustomVideoBitrate } = advancedSettingsDialog$.use.actions();
  const currentCustomVideoBitrate = Number(customVideoBitrate);

  return (
    <div className="flex flex-col gap-3 rounded-vera-medium border-vera-border bg-vera-background px-4 py-3">
      <p className="font-vera-plain text-vera-body-base-semibold text-vera-secondary">
        {t('advancedSettings.video.customBitrate.label')}
      </p>

      <p className="font-vera-plain text-vera-caption text-vera-tertiary">
        {t('advancedSettings.video.customBitrate.description')}
      </p>

      <div className="px-1">
        <input
          type="range"
          min={env.MIN_CUSTOM_VIDEO_BITRATE_BPS}
          max={env.MAX_CUSTOM_VIDEO_BITRATE_BPS}
          step={CUSTOM_VIDEO_BITRATE_STEP_BPS}
          value={customVideoBitrate}
          onChange={(event) => {
            setCustomVideoBitrate(clampCustomVideoBitrate(Number(event.target.value)));
          }}
          className="w-full accent-vera-primary"
          data-testid="advanced-settings-custom-video-bitrate-slider"
          aria-label={t('advancedSettings.video.customBitrate.label')}
        />

        <div className="mt-2 flex items-center justify-between font-vera-plain text-vera-caption text-vera-tertiary">
          <span>{t('advancedSettings.video.customBitrate.minimum')}</span>
          <span className="rounded-full bg-vera-surface px-2 py-1 text-vera-secondary">
            {formatVideoBitrateLabel({
              customVideoBitrate: currentCustomVideoBitrate,
              lowerUnitLabel: t('advancedSettings.video.customBitrate.units.lower'),
              higherUnitLabel: t('advancedSettings.video.customBitrate.units.higher'),
            })}
          </span>
          <span>{t('advancedSettings.video.customBitrate.maximum')}</span>
        </div>
      </div>
    </div>
  );
};

function clampCustomVideoBitrate(customVideoBitrate: number): number {
  if (customVideoBitrate < env.MIN_CUSTOM_VIDEO_BITRATE_BPS) {
    return env.MIN_CUSTOM_VIDEO_BITRATE_BPS;
  }

  if (customVideoBitrate > env.MAX_CUSTOM_VIDEO_BITRATE_BPS) {
    return env.MAX_CUSTOM_VIDEO_BITRATE_BPS;
  }

  return customVideoBitrate;
}

function formatVideoBitrateLabel({
  customVideoBitrate,
  lowerUnitLabel,
  higherUnitLabel,
}: {
  customVideoBitrate: number;
  lowerUnitLabel: string;
  higherUnitLabel: string;
}): string {
  if (customVideoBitrate >= 1_000_000) {
    return `${customVideoBitrate / 1_000_000} ${higherUnitLabel}`;
  }

  return `${Math.round(customVideoBitrate / 1_000)} ${lowerUnitLabel}`;
}

export default AdvancedSettingsCustomVideoBitrateField;
