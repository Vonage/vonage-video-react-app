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
  AdvancedSettingsTab,
} from '@components/AdvancedSettingsDialog/types/types';
import {
  ADVANCED_SETTINGS_AUDIO_BITRATE_MODE,
  ADVANCED_SETTINGS_BITRATE_MODE,
  ADVANCED_SETTINGS_CODEC_MODE,
  ADVANCED_SETTINGS_CONTENT_HINT,
} from '@components/AdvancedSettingsDialog/types/types';
import { env } from '../../env';
import { ResolutionSchema } from '@common/schemas';
import { Resolution } from '@common/types';

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
});

const advancedSettings$ = createGlobalState(INITIAL_STATE, {
  localStorage: {
    key: 'advancedSettings',
    selector: (state) =>
      ({
        ...state,
        isOpen: false,
      }) as advancedSettings,

    validator: ({ restored, initial }): advancedSettings => {
      const restoredState = advancedSettingsSchema.safeParse(restored);
      const fallbackState = initial as advancedSettings;

      if (restoredState.success) {
        return restoredState.data;
      }

      console.error('AdvancedSettings: invalid restored localStorage state', restoredState.error);

      return fallbackState;
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

export default advancedSettings$;
