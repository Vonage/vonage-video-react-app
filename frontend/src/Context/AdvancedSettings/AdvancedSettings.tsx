import createGlobalState from 'react-global-state-hooks/createGlobalState';
import actions from 'react-global-state-hooks/actions';
import { z } from 'zod';
import type {
  AdvancedSettingsAudioBitrateMode,
  AdvancedSettingsBitrateMode,
  AdvancedSettingsCodecMode,
  AdvancedSettingsCustomAudioBitrate,
  AdvancedSettingsContentHint,
  AdvancedSettingsCustomVideoBitrate,
  AdvancedSettingsFrameRate,
  AdvancedSettingsManualCodecOrder,
  AdvancedSettingsScreenShareCodecMode,
  AdvancedSettingsTab,
} from '@components/AdvancedSettingsDialog/types/types';
import {
  ADVANCED_SETTINGS_AUDIO_BITRATE_MODE,
  ADVANCED_SETTINGS_BITRATE_MODE,
  ADVANCED_SETTINGS_CODEC_MODE,
  ADVANCED_SETTINGS_CONTENT_HINT,
  ADVANCED_SETTINGS_SCREEN_SHARE_CODEC_MODE,
} from '@components/AdvancedSettingsDialog/types/types';
import { env } from '../../env';
import { ResolutionSchema } from '@common/schemas';
import { Resolution } from '@common/types';
import { STORAGE_KEYS } from '../../utils/storage';
import tryCatch from '@common/execution/tryCatch';

const INITIAL_STATE = {
  isOpen: false,
  selectedTab: 'general' as AdvancedSettingsTab,
  bitrateMode: ADVANCED_SETTINGS_BITRATE_MODE.default as AdvancedSettingsBitrateMode,
  customVideoBitrate: 500_000 as AdvancedSettingsCustomVideoBitrate,
  codecMode: ADVANCED_SETTINGS_CODEC_MODE.automatic,
  codecPriority: ['vp9', 'vp8', 'h264'] as AdvancedSettingsManualCodecOrder,
  frameRate: 30 as AdvancedSettingsFrameRate,
  resolution: env.DEFAULT_RESOLUTION,
  audioBitrateMode: ADVANCED_SETTINGS_AUDIO_BITRATE_MODE.automatic,
  customAudioBitrate: 128 as AdvancedSettingsCustomAudioBitrate,
  enableDtx: true,
  publisherAudioFallbackEnabled: false,
  subscriberAudioFallbackEnabled: false,
  publisherStatisticsEnabled: false,
  advancedNoiseSuppressionEnabled: false,
  echoCancellationEnabled: true,
  noiseSuppressionEnabled: true,
  autoGainControlEnabled: true,
  selfViewMirroringEnabled: true,
  videoStatsOverlayEnabled: env.SHOW_VIDEO_STATS,
  cameraContentHint: ADVANCED_SETTINGS_CONTENT_HINT.automatic as AdvancedSettingsContentHint,
  screenShareContentHint: ADVANCED_SETTINGS_CONTENT_HINT.detail as AdvancedSettingsContentHint,
  screenShareCodecMode:
    ADVANCED_SETTINGS_SCREEN_SHARE_CODEC_MODE.inherit as AdvancedSettingsScreenShareCodecMode,
  screenShareCodecPriority: ['vp9', 'vp8', 'h264'] as AdvancedSettingsManualCodecOrder,
  scalableScreenshareEnabled: false,
};

export type advancedSettings = typeof INITIAL_STATE;

const advancedSettingsSchema: z.ZodType<advancedSettings> = z.object({
  isOpen: z.boolean(),
  selectedTab: z.enum(['general', 'video', 'audio', 'statistics']),
  bitrateMode: z.enum(['default', 'bw_saver', 'extra_bw_saver', 'custom']),
  customVideoBitrate: z
    .number()
    .int()
    .min(env.MIN_CUSTOM_VIDEO_BITRATE_BPS)
    .max(env.MAX_CUSTOM_VIDEO_BITRATE_BPS),
  codecMode: z.enum(['automatic', 'manual']),
  codecPriority: z.tuple([
    z.enum(['vp8', 'vp9', 'h264']),
    z.enum(['vp8', 'vp9', 'h264']),
    z.enum(['vp8', 'vp9', 'h264']),
  ]),
  frameRate: z.custom<AdvancedSettingsFrameRate>(
    (value): value is AdvancedSettingsFrameRate =>
      typeof value === 'number' &&
      Number.isInteger(value) &&
      env.SUPPORTED_FRAME_RATES.includes(value),
    { message: 'Unsupported frame rate' }
  ),
  resolution: ResolutionSchema,
  audioBitrateMode: z.enum(['automatic', 'custom']),
  customAudioBitrate: z.number().int().min(6).max(510),
  enableDtx: z.boolean(),
  publisherAudioFallbackEnabled: z.boolean(),
  subscriberAudioFallbackEnabled: z.boolean(),
  publisherStatisticsEnabled: z.boolean(),
  advancedNoiseSuppressionEnabled: z.boolean(),
  echoCancellationEnabled: z.boolean(),
  noiseSuppressionEnabled: z.boolean(),
  autoGainControlEnabled: z.boolean(),
  selfViewMirroringEnabled: z.boolean(),
  videoStatsOverlayEnabled: z.boolean(),
  cameraContentHint: z.enum(['', 'motion', 'detail', 'text']),
  screenShareContentHint: z.enum(['', 'motion', 'detail', 'text']),
  screenShareCodecMode: z.enum(['inherit', 'automatic', 'manual']),
  screenShareCodecPriority: z.tuple([
    z.enum(['vp8', 'vp9', 'h264']),
    z.enum(['vp8', 'vp9', 'h264']),
    z.enum(['vp8', 'vp9', 'h264']),
  ]),
  scalableScreenshareEnabled: z.boolean(),
});

const ADVANCED_SETTINGS_STORAGE_KEY = 'advancedSettings';

const advancedSettings$ = createGlobalState(INITIAL_STATE, {
  localStorage: {
    key: ADVANCED_SETTINGS_STORAGE_KEY,
    selector: (state) =>
      ({
        ...state,
        isOpen: false,
      }) as advancedSettings,

    validator: ({ restored, initial }): advancedSettings => {
      const restoredState = advancedSettingsSchema.safeParse(restored as advancedSettings);

      if (!restoredState.success) {
        console.error('AdvancedSettings: invalid restored localStorage state', restoredState.error);

        return initial as advancedSettings;
      }

      if (isAdvancedNoiseSuppressionPersisted()) return restoredState.data;

      // First run after this setting shipped: adopt whatever the user already chose with the
      // in-call Reduce Noise toggle, which persists under its own key.
      return {
        ...restoredState.data,
        advancedNoiseSuppressionEnabled:
          window.localStorage.getItem(STORAGE_KEYS.NOISE_SUPPRESSION) === 'true',
      };
    },
  },
  actions: {
    open() {
      return () => {
        partialUpdate({ isOpen: true });
      };
    },
    close() {
      return () => {
        partialUpdate({ isOpen: false });
      };
    },
    setSelectedTab(tab: AdvancedSettingsTab) {
      return () => {
        partialUpdate({ selectedTab: tab });
      };
    },
    setBitrateMode(value: AdvancedSettingsBitrateMode) {
      return () => {
        partialUpdate({ bitrateMode: value });
      };
    },
    setCustomVideoBitrate(value: AdvancedSettingsCustomVideoBitrate) {
      return () => {
        partialUpdate({ customVideoBitrate: value });
      };
    },
    setCodecMode(value: AdvancedSettingsCodecMode) {
      return () => {
        partialUpdate({ codecMode: value });
      };
    },
    setCodecPriority(value: AdvancedSettingsManualCodecOrder) {
      return () => {
        partialUpdate({ codecPriority: value });
      };
    },
    setFrameRate(value: AdvancedSettingsFrameRate) {
      return () => {
        partialUpdate({ frameRate: value });
      };
    },
    setResolution(value: Resolution) {
      return () => {
        partialUpdate({ resolution: value });
      };
    },
    setAudioBitrateMode(value: AdvancedSettingsAudioBitrateMode) {
      return () => {
        partialUpdate({ audioBitrateMode: value });
      };
    },
    setCustomAudioBitrate(value: AdvancedSettingsCustomAudioBitrate) {
      return () => {
        partialUpdate({ customAudioBitrate: value });
      };
    },
    setEnableDtx(value: boolean) {
      return () => {
        partialUpdate({ enableDtx: value });
      };
    },
    setPublisherAudioFallbackEnabled(value: boolean) {
      return () => {
        partialUpdate({ publisherAudioFallbackEnabled: value });
      };
    },
    setSubscriberAudioFallbackEnabled(value: boolean) {
      return () => {
        partialUpdate({ subscriberAudioFallbackEnabled: value });
      };
    },
    setPublisherStatisticsEnabled(value: boolean) {
      return () => {
        partialUpdate({ publisherStatisticsEnabled: value });
      };
    },
    setAdvancedNoiseSuppressionEnabled(value: boolean) {
      return () => {
        partialUpdate({ advancedNoiseSuppressionEnabled: value });
      };
    },
    setEchoCancellationEnabled(value: boolean) {
      return () => {
        partialUpdate({ echoCancellationEnabled: value });
      };
    },
    setNoiseSuppressionEnabled(value: boolean) {
      return () => {
        partialUpdate({ noiseSuppressionEnabled: value });
      };
    },
    setAutoGainControlEnabled(value: boolean) {
      return () => {
        partialUpdate({ autoGainControlEnabled: value });
      };
    },
    setSelfViewMirroringEnabled(value: boolean) {
      return () => {
        partialUpdate({ selfViewMirroringEnabled: value });
      };
    },
    setVideoStatsOverlayEnabled(value: boolean) {
      return () => {
        partialUpdate({ videoStatsOverlayEnabled: value });
      };
    },
    setCameraContentHint(value: AdvancedSettingsContentHint) {
      return () => {
        partialUpdate({ cameraContentHint: value });
      };
    },
    setScreenShareContentHint(value: AdvancedSettingsContentHint) {
      return () => {
        partialUpdate({ screenShareContentHint: value });
      };
    },
    setScreenShareCodecMode(value: AdvancedSettingsScreenShareCodecMode) {
      return () => {
        partialUpdate({ screenShareCodecMode: value });
      };
    },
    setScreenShareCodecPriority(value: AdvancedSettingsManualCodecOrder) {
      return () => {
        partialUpdate({ screenShareCodecPriority: value });
      };
    },
    setScalableScreenshareEnabled(value: boolean) {
      return () => {
        partialUpdate({ scalableScreenshareEnabled: value });
      };
    },
  },
});

const internals = actions(advancedSettings$, {
  update: (updatedValues: Partial<advancedSettings>) => {
    return ({ setState }) => {
      setState((state) => ({ ...state, ...updatedValues }));
    };
  },
});

function partialUpdate(partialState: Partial<advancedSettings>) {
  internals.update(partialState);
}

/**
 * Whether the persisted settings already carry `advancedNoiseSuppressionEnabled`.
 *
 * The store merges the persisted payload over the initial state before handing it to the
 * validator, so the restored object always has every key regardless of what was actually
 * written. Reading the raw `{ s: state, v: version }` envelope is the only way to tell a
 * pre-existing value apart from the default we just merged in.
 */
function isAdvancedNoiseSuppressionPersisted(): boolean {
  const persistedEnvelope = window.localStorage.getItem(ADVANCED_SETTINGS_STORAGE_KEY);

  if (!persistedEnvelope) return false;

  const { result } = tryCatch(
    () => JSON.parse(persistedEnvelope) as { s?: Partial<advancedSettings> }
  );

  return typeof result?.s?.advancedNoiseSuppressionEnabled === 'boolean';
}

export default advancedSettings$;
