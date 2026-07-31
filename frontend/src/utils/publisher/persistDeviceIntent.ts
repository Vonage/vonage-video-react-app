import { setStorageItem, STORAGE_KEYS } from '@utils/storage';
import type { DeviceKind } from './deviceAccess';

/**
 * Persists the user's on/off intent for a device. Storage is the one channel that drives the
 * waiting-room re-init, survives a whole-publisher rebuild, and is read by the in-call publisher on
 * join — so writing it here keeps the device's state consistent everywhere.
 */
const persistDeviceIntent = ({
  device,
  enabled,
}: {
  device: DeviceKind;
  enabled: boolean;
}): void => {
  setStorageItem(
    device === 'microphone' ? STORAGE_KEYS.AUDIO_SOURCE_ENABLED : STORAGE_KEYS.VIDEO_SOURCE_ENABLED,
    enabled.toString()
  );
};

export default persistDeviceIntent;
