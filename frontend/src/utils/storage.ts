export const STORAGE_KEYS = {
  AUDIO_SOURCE: 'audioSource',
  AUDIO_SOURCE_ENABLED: 'audioSourceEnabled',
  VIDEO_SOURCE: 'videoSource',
  VIDEO_SOURCE_ENABLED: 'videoSourceEnabled',
  NOISE_SUPPRESSION: 'noiseSuppression',
  BACKGROUND_REPLACEMENT: 'backgroundReplacement',
  USERNAME: 'username',
  BACKGROUND_IMAGE: 'userBackgroundImage',
};

export const setStorageItem = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Safari private browsing or quota exceeded — degrade silently rather than crash
    // the calling code path (e.g. saving settings).
  }
};

export const getStorageItem = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
