import createGlobalState from 'react-global-state-hooks/createGlobalState';
import actions from 'react-global-state-hooks/actions';
import type {
  AdvancedSettings,
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
} from '@components/AdvancedSettingsDialog/schemas';
import {
  ADVANCED_SETTINGS_AUDIO_BITRATE_MODE,
  ADVANCED_SETTINGS_BITRATE_MODE,
  ADVANCED_SETTINGS_CODEC_MODE,
  ADVANCED_SETTINGS_CONTENT_HINT,
  ADVANCED_SETTINGS_SCREEN_SHARE_CODEC_MODE,
  advancedSettingsSchema,
} from '@components/AdvancedSettingsDialog/schemas';
import { env } from '../../env';
import { Resolution } from '@common/types';

export type { AdvancedSettings };

const INITIAL_STATE = advancedSettingsSchema.parse({
  isOpen: false,
  selectedTab: 'general',
  bitrateMode: ADVANCED_SETTINGS_BITRATE_MODE.default,
  customVideoBitrate: 500_000,
  codecMode: ADVANCED_SETTINGS_CODEC_MODE.automatic,
  codecPriority: ['vp9', 'vp8', 'h264'],
  frameRate: 30,
  resolution: env.DEFAULT_RESOLUTION,
  audioBitrateMode: ADVANCED_SETTINGS_AUDIO_BITRATE_MODE.automatic,
  customAudioBitrate: 128,
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
  cameraContentHint: ADVANCED_SETTINGS_CONTENT_HINT.automatic,
  screenShareContentHint: ADVANCED_SETTINGS_CONTENT_HINT.detail,
  screenShareCodecMode: ADVANCED_SETTINGS_SCREEN_SHARE_CODEC_MODE.inherit,
  screenShareCodecPriority: ['vp9', 'vp8', 'h264'],
  scalableScreenshareEnabled: false,
  screenShareFrameRate: null,
  screenShareResolution: null,
  screenShareBitrateMode: null,
  screenShareCustomVideoBitrate: 500_000,
});

const advancedSettings$ = createGlobalState(INITIAL_STATE, {
  localStorage: {
    key: 'advancedSettings',
    selector: (state) =>
      ({
        ...state,
        isOpen: false,
      }) as AdvancedSettings,

    validator: ({ restored, initial }): AdvancedSettings => {
      const restoredState = advancedSettingsSchema.safeParse(restored);
      const fallbackState = initial as AdvancedSettings;

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
    setScreenShareFrameRate(value: AdvancedSettingsFrameRate | null) {
      return () => {
        partialUpdate({ screenShareFrameRate: value });
      };
    },
    setScreenShareResolution(value: Resolution | null) {
      return () => {
        partialUpdate({ screenShareResolution: value });
      };
    },
    setScreenShareBitrateMode(value: AdvancedSettingsBitrateMode | null) {
      return () => {
        partialUpdate({ screenShareBitrateMode: value });
      };
    },
    setScreenShareCustomVideoBitrate(value: AdvancedSettingsCustomVideoBitrate) {
      return () => {
        partialUpdate({ screenShareCustomVideoBitrate: value });
      };
    },
  },
});

const internals = actions(advancedSettings$, {
  update: (updatedValues: Partial<AdvancedSettings>) => {
    return ({ setState }) => {
      setState((state) => ({ ...state, ...updatedValues }));
    };
  },
});

function partialUpdate(partialState: Partial<AdvancedSettings>) {
  internals.update(partialState);
}

export default advancedSettings$;
