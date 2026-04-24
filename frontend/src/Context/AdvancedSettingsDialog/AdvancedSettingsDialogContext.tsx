import createContext from 'react-global-state-hooks/createContext';
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

const INITIAL_STATE = {
  isOpen: false,
  selectedTab: 'general' as AdvancedSettingsTab,
  bitrateMode: ADVANCED_SETTINGS_BITRATE_MODE.default as AdvancedSettingsBitrateMode,
  customVideoBitrate: 500_000 as AdvancedSettingsCustomVideoBitrate,
  codecMode: ADVANCED_SETTINGS_CODEC_MODE.automatic,
  codecPriority: ['vp9', 'vp8', 'h264'] as AdvancedSettingsManualCodecOrder,
  frameRate: 30 as AdvancedSettingsFrameRate,
  resolution: '640x480' as AdvancedSettingsResolution,
  audioBitrateMode: ADVANCED_SETTINGS_AUDIO_BITRATE_MODE.automatic,
  customAudioBitrate: 128 as AdvancedSettingsCustomAudioBitrate,
  enableDtx: false,
  publisherAudioFallbackEnabled: false,
  subscriberAudioFallbackEnabled: false,
  publisherStatisticsEnabled: false,
};

export type AdvancedSettingsDialogState = typeof INITIAL_STATE;

const advancedSettingsDialog$ = createContext(INITIAL_STATE, {
  actions: {
    open() {
      return ({ setState }) => {
        setState((state) => ({ ...state, isOpen: true }));
      };
    },
    close() {
      return ({ setState }) => {
        setState((state) => ({ ...state, isOpen: false }));
      };
    },
    setSelectedTab(tab: AdvancedSettingsTab) {
      return ({ setState }) => {
        setState((state) => ({ ...state, selectedTab: tab }));
      };
    },
    setBitrateMode(value: AdvancedSettingsBitrateMode) {
      return ({ setState }) => {
        setState((state) => ({ ...state, bitrateMode: value }));
      };
    },
    setCustomVideoBitrate(value: AdvancedSettingsCustomVideoBitrate) {
      return ({ setState }) => {
        setState((state) => ({ ...state, customVideoBitrate: value }));
      };
    },
    setCodecMode(value: AdvancedSettingsCodecMode) {
      return ({ setState }) => {
        setState((state) => ({ ...state, codecMode: value }));
      };
    },
    setCodecPriority(value: AdvancedSettingsManualCodecOrder) {
      return ({ setState }) => {
        setState((state) => ({ ...state, codecPriority: value }));
      };
    },
    setFrameRate(value: AdvancedSettingsFrameRate) {
      return ({ setState }) => {
        setState((state) => ({ ...state, frameRate: value }));
      };
    },
    setResolution(value: AdvancedSettingsResolution) {
      return ({ setState }) => {
        setState((state) => ({ ...state, resolution: value }));
      };
    },
    setAudioBitrateMode(value: AdvancedSettingsAudioBitrateMode) {
      return ({ setState }) => {
        setState((state) => ({ ...state, audioBitrateMode: value }));
      };
    },
    setCustomAudioBitrate(value: AdvancedSettingsCustomAudioBitrate) {
      return ({ setState }) => {
        setState((state) => ({ ...state, customAudioBitrate: value }));
      };
    },
    setEnableDtx(value: boolean) {
      return ({ setState }) => {
        setState((state) => ({ ...state, enableDtx: value }));
      };
    },
    setPublisherAudioFallbackEnabled(value: boolean) {
      return ({ setState }) => {
        setState((state) => ({ ...state, publisherAudioFallbackEnabled: value }));
      };
    },
    setSubscriberAudioFallbackEnabled(value: boolean) {
      return ({ setState }) => {
        setState((state) => ({ ...state, subscriberAudioFallbackEnabled: value }));
      };
    },
    setPublisherStatisticsEnabled(value: boolean) {
      return ({ setState }) => {
        setState((state) => ({ ...state, publisherStatisticsEnabled: value }));
      };
    },
  },
});

export default advancedSettingsDialog$;
