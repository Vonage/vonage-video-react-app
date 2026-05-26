import { VideoFilter } from '@vonage/client-sdk-video';
import { isWebKit } from '@web/platform';

/**
 * Checks if the browser support the Vonage Video getActiveAudioOutputDevice API
 * @returns {boolean} - Returns `true` if the current browser supports the API, else `false`.
 */
export const isGetActiveAudioOutputDeviceSupported = () => {
  const userAgent = navigator.userAgent.toLowerCase();

  const isFirefox = userAgent.includes('firefox');

  const isAndroid = userAgent.includes('android');

  return !isFirefox && !isWebKit() && !isAndroid;
};

/**
 * Parses a raw JSON string into a VideoFilter object if valid.
 * @param {string | null} raw - The raw JSON string representing a video filter.
 * @returns {VideoFilter | undefined} - The parsed VideoFilter object or undefined if invalid.
 */
export const parseVideoFilter = (raw: string | null): VideoFilter | undefined => {
  if (!raw) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.type === 'string' &&
      (parsed.type === 'backgroundBlur' || parsed.type === 'backgroundReplacement')
    ) {
      return parsed as VideoFilter;
    }

    return undefined;
  } catch {
    return undefined;
  }
};
