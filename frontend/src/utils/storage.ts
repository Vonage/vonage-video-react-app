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
  window.localStorage.setItem(key, value);
};

export const getStorageItem = (key: string): string | null => {
  return window.localStorage.getItem(key);
};
