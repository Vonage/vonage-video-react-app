import { getStorageItem, STORAGE_KEYS } from '@utils/storage';
import { env } from '../../env';

/**
 * Whether a device should start enabled when joining a room.
 *
 * The configuration flag takes precedence over the user's stored preference, so a deployment that
 * joins with the device off cannot be overridden by a previous session.
 * @param {'audio' | 'video'} deviceType - the device to resolve the initial state for
 * @returns {boolean} - true when the device should start enabled
 */
const isDeviceEnabledOnJoin = (deviceType: 'audio' | 'video'): boolean => {
  if (deviceType === 'audio') {
    return env.ALLOW_AUDIO_ON_JOIN && getStorageItem(STORAGE_KEYS.AUDIO_SOURCE_ENABLED) !== 'false';
  }

  return env.ALLOW_VIDEO_ON_JOIN && getStorageItem(STORAGE_KEYS.VIDEO_SOURCE_ENABLED) !== 'false';
};

export default isDeviceEnabledOnJoin;
