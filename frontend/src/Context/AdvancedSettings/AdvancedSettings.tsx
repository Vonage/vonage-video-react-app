import createGlobalState from 'react-global-state-hooks/createGlobalState';
import actions from 'react-global-state-hooks/actions';
import type {
  AdvancedSettingsAudioBitrateMode,
  AdvancedSettingsBitrateMode,
  AdvancedSettingsCodecMode,
  AdvancedSettingsCustomAudioBitrate,
  AdvancedSettingsCustomVideoBitrate,
  AdvancedSettingsFrameRate,
  AdvancedSettingsManualCodecOrder,
  AdvancedSettingsResolution,
  AdvancedSettingsTab,
} from '@components/AdvancedSettingsDialog/types/types';
import {
  ADVANCED_SETTINGS_AUDIO_BITRATE_MODE,
  ADVANCED_SETTINGS_BITRATE_MODE,
  ADVANCED_SETTINGS_CODEC_MODE,
} from '@components/AdvancedSettingsDialog/types/types';
import { env } from '../../env';

const INITIAL_STATE = {
  isOpen: false,
  selectedTab: 'general' as AdvancedSettingsTab,
  bitrateMode: ADVANCED_SETTINGS_BITRATE_MODE.default as AdvancedSettingsBitrateMode,
  customVideoBitrate: 500_000 as AdvancedSettingsCustomVideoBitrate,
  codecMode: ADVANCED_SETTINGS_CODEC_MODE.automatic,
  codecPriority: ['vp9', 'vp8', 'h264'] as AdvancedSettingsManualCodecOrder,
  frameRate: 30 as AdvancedSettingsFrameRate,
  resolution: env.DEFAULT_RESOLUTION ?? '1280x720',
  audioBitrateMode: ADVANCED_SETTINGS_AUDIO_BITRATE_MODE.automatic,
  customAudioBitrate: 128 as AdvancedSettingsCustomAudioBitrate,
  enableDtx: false,
  publisherAudioFallbackEnabled: false,
  subscriberAudioFallbackEnabled: false,
  publisherStatisticsEnabled: false,
};

export type AdvancedSettingsDialogState = typeof INITIAL_STATE;

const advancedSettings$ = createGlobalState(INITIAL_STATE, {
  localStorage: {
    key: 'advancedSettings',
    selector: (state) =>
      ({
        ...state,
        isOpen: false,
      }) as AdvancedSettingsDialogState,

    validator: (_state) => {
      // zod
      // advancedSettingsSchema.parse(state);
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
    setResolution(value: AdvancedSettingsResolution) {
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
  },
});

const internals = actions(advancedSettings$, {
  update: (updatedValues: Partial<AdvancedSettingsDialogState>) => {
    return ({ setState }) => {
      setState((state) => ({ ...state, ...updatedValues }));
    };
  },
});

function partialUpdate(partialState: Partial<AdvancedSettingsDialogState>) {
  internals.update(partialState);
}

export default advancedSettings$;
