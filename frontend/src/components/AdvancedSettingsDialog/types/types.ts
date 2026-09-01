export type AdvancedSettingsTab = 'general' | 'video' | 'audio' | 'statistics';

export type AdvancedSettingsBitrateMode = 'default' | 'bw_saver' | 'extra_bw_saver' | 'custom';

export const ADVANCED_SETTINGS_BITRATE_MODE = {
  default: 'default',
  bwSaver: 'bw_saver',
  extraBwSaver: 'extra_bw_saver',
  custom: 'custom',
} as const satisfies Record<string, AdvancedSettingsBitrateMode>;

export type AdvancedSettingsCustomVideoBitrate = number;

export type AdvancedSettingsCodecMode = 'automatic' | 'manual';

export const ADVANCED_SETTINGS_CODEC_MODE = {
  automatic: 'automatic' as AdvancedSettingsCodecMode,
  manual: 'manual' as AdvancedSettingsCodecMode,
};

export type AdvancedSettingsScreenShareCodecMode = 'inherit' | AdvancedSettingsCodecMode;

export const ADVANCED_SETTINGS_SCREEN_SHARE_CODEC_MODE = {
  inherit: 'inherit',
  automatic: 'automatic',
  manual: 'manual',
} as const satisfies Record<string, AdvancedSettingsScreenShareCodecMode>;

export type AdvancedSettingsVideoCodec = 'vp8' | 'vp9' | 'h264';

export type AdvancedSettingsManualCodecOrder = [
  AdvancedSettingsVideoCodec,
  AdvancedSettingsVideoCodec,
  AdvancedSettingsVideoCodec,
];

export type AdvancedSettingsFrameRate = NonNullable<
  import('@vonage/client-sdk-video').GetUserMediaProperties['frameRate']
>;

export type AdvancedSettingsContentHint = import('@vonage/client-sdk-video').VideoContentHint;

export const ADVANCED_SETTINGS_CONTENT_HINT = {
  automatic: '',
  motion: 'motion',
  detail: 'detail',
  text: 'text',
} as const satisfies Record<string, AdvancedSettingsContentHint>;

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
