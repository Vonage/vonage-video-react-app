import type { TFunction } from 'i18next';
import type { DeniedDevices } from './deviceAccess';

/**
 * Human-readable, translated label for the currently denied device(s), e.g. "camera",
 * "microphone", or "camera and microphone". Callers should only use it when at least one
 * device is denied (see {@link hasDeniedDevice}); it defaults to the camera label otherwise.
 */
const deniedDevicesLabel = (denied: DeniedDevices, t: TFunction): string => {
  if (denied.camera && denied.microphone) {
    return t('deviceAccessHint.cameraAndMicrophone');
  }
  if (denied.microphone) {
    return t('deviceAccessHint.microphone');
  }
  return t('deviceAccessHint.camera');
};

export default deniedDevicesLabel;
