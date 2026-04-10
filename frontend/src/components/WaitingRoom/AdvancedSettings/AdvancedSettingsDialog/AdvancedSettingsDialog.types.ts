import type { Resolution } from '../../../../env';

export type AdvancedSettingsDialogProps = {
  isAdvancedSettingsOpen: boolean;
  setIsAdvancedSettingsOpen: (open: boolean) => void;
};

export type AdvancedSettingsTab = 'general' | 'video' | 'audio' | 'statistics';

export type AdvancedSettingsBitrateMode =
  import('@vonage/client-sdk-video').VideoBitratePresetInput;

export type AdvancedSettingsCodecMode = 'automatic' | 'manual';

export type AdvancedSettingsFrameRate = NonNullable<
  import('@vonage/client-sdk-video').GetUserMediaProperties['frameRate']
>;

export type AdvancedSettingsResolution = Resolution;

export type AdvancedSettingsAudioBitrate = number;

export type AdvancedSettingsSelectOption<TValue extends string | number = string> = {
  value: TValue;
  label: string;
};
