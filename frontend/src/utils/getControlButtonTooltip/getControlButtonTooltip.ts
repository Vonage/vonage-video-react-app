export type GetControlButtonTooltipType = {
  isAudio: boolean;
  allowMicrophoneControl: boolean;
  allowCameraControl: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  t: (key: string) => string;
};

export default (options: GetControlButtonTooltipType): string => {
  const { isAudio, allowMicrophoneControl, allowCameraControl, isAudioEnabled, isVideoEnabled, t } =
    options;

  if (isAudio) {
    if (allowMicrophoneControl) {
      return isAudioEnabled ? t('devices.audio.disable') : t('devices.audio.enable');
    }
    return t('devices.audio.disabled');
  }

  if (allowCameraControl) {
    return isVideoEnabled ? t('devices.video.disable') : t('devices.video.enable');
  }
  return t('devices.video.disabled');
};
