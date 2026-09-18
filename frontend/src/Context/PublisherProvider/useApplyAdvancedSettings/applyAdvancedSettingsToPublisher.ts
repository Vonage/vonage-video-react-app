import type { Publisher } from '@vonage/client-sdk-video';
import { assertResult, attempt } from '@common/execution';
import tryCatch from '@common/execution/tryCatch';
import { makeApplicationErrorMapper } from '@core/errors';
import handleApplyAdvancedSettingsError from './handleApplyAdvancedSettingsError';
import { ADVANCED_SETTINGS_BITRATE_MODE } from '@components/AdvancedSettingsDialog/schemas';
import type {
  AdvancedSettingsBitrateMode,
  AdvancedSettingsContentHint,
  AdvancedSettingsCustomVideoBitrate,
  AdvancedSettingsFrameRate,
} from '@components/AdvancedSettingsDialog/schemas';
import { t } from 'i18next';
import { Resolution } from '@common/types';
import { decodeSessionId } from '@common/helpers';

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

export const applyContentHint = async (
  publisher: Publisher | null,
  contentHint: AdvancedSettingsContentHint
): Promise<void> => {
  if (!publisher) return;
  const hasVideoTrack = publisher?.getVideoSource()?.track;
  if (!hasVideoTrack) return;

  await Promise.resolve(publisher.setVideoContentHint(contentHint));
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

  const { result: partnerId } = tryCatch((): string | null => {
    const sessionId = publisher?.session?.sessionId;
    if (!sessionId) return null;
    return decodeSessionId({ sessionId }).applicationId;
  }, null);

  await attempt(
    () => applyFrameRate(publisher, frameRate),
    handleApplyAdvancedSettingsError({
      message: 'Failed to apply frame rate',
      eventSource: 'applyAdvancedSettingsToPublisher.applyFrameRate',
      partnerId,
    })
  );

  await attempt(
    () => applyResolution(publisher, resolution),
    handleApplyAdvancedSettingsError({
      message: 'Failed to apply resolution',
      eventSource: 'applyAdvancedSettingsToPublisher.applyResolution',
      partnerId,
    })
  );

  await attempt(
    () => applyBitrate(publisher, bitrateMode, customVideoBitrate),
    handleApplyAdvancedSettingsError({
      message: 'Failed to apply bitrate',
      eventSource: 'applyAdvancedSettingsToPublisher.applyBitrate',
      partnerId,
    })
  );

  await attempt(
    () => applyContentHint(publisher, contentHint),
    handleApplyAdvancedSettingsError({
      message: 'Failed to apply content hint',
      eventSource: 'applyAdvancedSettingsToPublisher.applyContentHint',
      partnerId,
    })
  );
};

export default applyAdvancedSettingsToPublisher;
