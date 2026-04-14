import type { Resolution } from '../../../../env';

export type AdvancedSettingsDialogProps = {
  isAdvancedSettingsOpen: boolean;
  setIsAdvancedSettingsOpen: (open: boolean) => void;
};

export type AdvancedSettingsTab = 'general' | 'video' | 'audio' | 'statistics';

export type AdvancedSettingsBitrateMode = import('@vonage/client-sdk-video').VideoBitratePreset;

export const ADVANCED_SETTINGS_BITRATE_MODE = {
  default: 'default' as AdvancedSettingsBitrateMode,
  bwSaver: 'bw_saver' as AdvancedSettingsBitrateMode,
  extraBwSaver: 'extra_bw_saver' as AdvancedSettingsBitrateMode,
  custom: 'custom' as AdvancedSettingsBitrateMode,
};

export type AdvancedSettingsCustomVideoBitrate = number;

export type AdvancedSettingsCodecMode = 'automatic' | 'manual';

export const ADVANCED_SETTINGS_CODEC_MODE = {
  automatic: 'automatic' as AdvancedSettingsCodecMode,
  manual: 'manual' as AdvancedSettingsCodecMode,
};

export type AdvancedSettingsVideoCodec = 'vp8' | 'vp9' | 'h264';

export type AdvancedSettingsManualCodecOrder = [
  AdvancedSettingsVideoCodec,
  AdvancedSettingsVideoCodec,
  AdvancedSettingsVideoCodec,
];

export type AdvancedSettingsFrameRate = NonNullable<
  import('@vonage/client-sdk-video').GetUserMediaProperties['frameRate']
>;

export type AdvancedSettingsResolution = Resolution;

export type AdvancedSettingsAudioBitrateMode = 'automatic' | 'custom';

export const ADVANCED_SETTINGS_AUDIO_BITRATE_MODE = {
  automatic: 'automatic' as AdvancedSettingsAudioBitrateMode,
  custom: 'custom' as AdvancedSettingsAudioBitrateMode,
};

export type AdvancedSettingsCustomAudioBitrate = number;

export type AdvancedSettingsSelectOption<TValue extends string | number = string> = {
  value: TValue;
  label: string;
};
