import { describe, expect, it, afterEach } from 'vitest';
import { setStorageItem, STORAGE_KEYS } from '@utils/storage';
import isDeviceEnabledOnJoin from './isDeviceEnabledOnJoin';
import { env } from '../../env';

describe('isDeviceEnabledOnJoin', () => {
  afterEach(() => {
    env.reset();
    localStorage.clear();
  });

  it('keeps the device off when the on-join flag is disabled, even if the user left it on', () => {
    setStorageItem(STORAGE_KEYS.VIDEO_SOURCE_ENABLED, 'true');
    setStorageItem(STORAGE_KEYS.AUDIO_SOURCE_ENABLED, 'true');

    env.partialUpdate({ ALLOW_VIDEO_ON_JOIN: false, ALLOW_AUDIO_ON_JOIN: false });

    expect(isDeviceEnabledOnJoin('video')).toBe(false);
    expect(isDeviceEnabledOnJoin('audio')).toBe(false);
  });

  it('honours the stored preference when the on-join flag is enabled', () => {
    env.partialUpdate({ ALLOW_VIDEO_ON_JOIN: true, ALLOW_AUDIO_ON_JOIN: true });

    setStorageItem(STORAGE_KEYS.VIDEO_SOURCE_ENABLED, 'false');

    expect(isDeviceEnabledOnJoin('video')).toBe(false);
    expect(isDeviceEnabledOnJoin('audio')).toBe(true);
  });
});
