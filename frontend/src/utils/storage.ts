export const STORAGE_KEYS = {
  AUDIO_SOURCE: 'audioSource',
  VIDEO_SOURCE: 'videoSource',
  NOISE_SUPPRESSION: 'noiseSuppression',
  BACKGROUND_REPLACEMENT: 'backgroundReplacement',
  USERNAME: 'username',
};

export const setStorageItem = (key: string, value: string) => {
  window.localStorage.setItem(key, value);
};

export const getStorageItem = (key: string): string | null => {
  return window.localStorage.getItem(key);
};
