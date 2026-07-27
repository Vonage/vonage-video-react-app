import type { Publisher } from '@vonage/client-sdk-video';
import { assertResult } from '@common/execution';
import tryCatch from '@common/execution/tryCatch';
import { makeApplicationErrorMapper } from '@core/errors';
import { ADVANCED_SETTINGS_BITRATE_MODE } from '@components/AdvancedSettingsDialog/types/types';
import type {
  AdvancedSettingsBitrateMode,
  AdvancedSettingsContentHint,
  AdvancedSettingsCustomVideoBitrate,
  AdvancedSettingsFrameRate,
} from '@components/AdvancedSettingsDialog/types/types';
import { t } from 'i18next';
import { Resolution } from '@common/types';

export const applyFrameRate = async (
  publisher: Publisher | null,
  frameRate: AdvancedSettingsFrameRate
): Promise<void> => {
  if (!publisher) return;
  const hasVideoTrack = publisher?.getVideoSource()?.track;
  if (!hasVideoTrack) return;

  await assertResult(
    () => publisher.setPreferredFrameRate(frameRate),
    makeApplicationErrorMapper(t('advancedSettings.video.error.frameRateNotSupported'))
  );
};

export const applyResolution = async (
  publisher: Publisher | null,
  resolution: Resolution
): Promise<void> => {
  if (!publisher) return;
  const hasVideoTrack = publisher?.getVideoSource()?.track;
  if (!hasVideoTrack) return;

  const [width, height] = resolution.split('x').map(Number);
  await assertResult(
    () => publisher.setPreferredResolution({ width, height }),
    makeApplicationErrorMapper(t('advancedSettings.video.error.resolutionNotSupported'))
  );
};

export const applyContentHint = (
  publisher: Publisher | null,
  contentHint: AdvancedSettingsContentHint
): void => {
  if (!publisher) return;
  const hasVideoTrack = publisher?.getVideoSource()?.track;
  if (!hasVideoTrack) return;

  publisher.setVideoContentHint(contentHint);
};

export const applyBitrate = async (
  publisher: Publisher | null,
  bitrateMode: AdvancedSettingsBitrateMode,
  customVideoBitrate: AdvancedSettingsCustomVideoBitrate
): Promise<void> => {
  if (!publisher) return;
  const hasVideoTrack = publisher?.getVideoSource()?.track;
  if (!hasVideoTrack) return;

  if (bitrateMode === ADVANCED_SETTINGS_BITRATE_MODE.custom) {
    await assertResult(
      () => publisher.setMaxVideoBitrate(customVideoBitrate),
      makeApplicationErrorMapper(t('advancedSettings.video.error.bitrateNotSupported'))
    );
  } else {
    await assertResult(
      () => publisher.setVideoBitratePreset(bitrateMode),
      makeApplicationErrorMapper(t('advancedSettings.video.error.bitrateNotSupported'))
    );
  }
};

const applyAdvancedSettingsToPublisher = async (
  publisher: Publisher | null,
  args: {
    frameRate: AdvancedSettingsFrameRate;
    resolution: Resolution;
    bitrateMode: AdvancedSettingsBitrateMode;
    customVideoBitrate: AdvancedSettingsCustomVideoBitrate;
    contentHint: AdvancedSettingsContentHint;
  }
): Promise<void> => {
  const { frameRate, resolution, bitrateMode, customVideoBitrate, contentHint } = args;

  const { error: frameRateError } = await tryCatch(() => applyFrameRate(publisher, frameRate));

  if (frameRateError)
    console.error('applyAdvancedSettingsToPublisher: setPreferredFrameRate failed', frameRateError);

  const { error: resolutionError } = await tryCatch(() => applyResolution(publisher, resolution));
  if (resolutionError)
    console.error(
      'applyAdvancedSettingsToPublisher: setPreferredResolution failed',
      resolutionError
    );

  const { error: bitrateError } = await tryCatch(() =>
    applyBitrate(publisher, bitrateMode, customVideoBitrate)
  );

  if (bitrateError) {
    const methodName =
      bitrateMode === ADVANCED_SETTINGS_BITRATE_MODE.custom
        ? 'setMaxVideoBitrate'
        : 'setVideoBitratePreset';
    console.error(`applyAdvancedSettingsToPublisher: ${methodName} failed`, bitrateError);
  }

  const { error: contentHintError } = tryCatch(() => applyContentHint(publisher, contentHint));

  if (contentHintError)
    console.error('applyAdvancedSettingsToPublisher: setVideoContentHint failed', contentHintError);
};

export default applyAdvancedSettingsToPublisher;
