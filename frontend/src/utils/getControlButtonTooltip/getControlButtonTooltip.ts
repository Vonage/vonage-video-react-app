export type GetControlButtonTooltipType = {
  isAudio: boolean;
  isBlocked: boolean;
  allowMicrophoneControl: boolean;
  allowCameraControl: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  t: (key: string) => string;
};

/**
 * Generates appropriate tooltip text for device control buttons based on device type,
 * permission settings, and current device state.
 * @param {GetControlButtonTooltipType} options - Configuration object for tooltip generation
 *  @property {boolean} isAudio - True for microphone controls, false for camera controls
 *  @property {boolean} isBlocked - Whether the browser has blocked this device's permission
 *  @property {boolean} allowMicrophoneControl - Whether microphone can be toggled (from config)
 *  @property {boolean} allowCameraControl - Whether camera can be toggled (from config)
 *  @property {boolean} isAudioEnabled - Current microphone mute state (true = unmuted)
 *  @property {boolean} isVideoEnabled - Current camera state (true = on)
 *  @property {Function} t - Translation function for localized text
 * @returns {string} Localized tooltip text appropriate for the current device state
 */
export default (options: GetControlButtonTooltipType): string => {
  const {
    isAudio,
    isBlocked,
    allowMicrophoneControl,
    allowCameraControl,
    isAudioEnabled,
    isVideoEnabled,
    t,
  } = options;

  // A browser-blocked device takes precedence: the button can't toggle until access is restored.
  if (isBlocked) {
    return isAudio
      ? t('devices.audio.microphone.state.blocked')
      : t('devices.video.camera.state.blocked');
  }

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
