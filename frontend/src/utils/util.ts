import { VideoFilter } from '@vonage/client-sdk-video';
import type { MediaDeviceInfoJSON } from '@web/types';
import { isMobile, isWebKit } from '@web/platform';

// Re-export platform helpers for backwards compatibility
export { isMobile, isWebKit };

/**
 * Returns the device ID for the current audio input source.
 * @param {Device[]} audioInputDevices - An array of audio input devices.
 * @param {MediaStreamTrack} currentAudioSource - The current audio source.
 * @returns {string} - Returns device ID for the matching audio input device, or an empty string if there is no match or the input parameters are invalid.
 */
export const getAudioSourceDeviceId = (
  audioInputDevices: MediaDeviceInfoJSON[],
  currentAudioSource: MediaStreamTrack
): string => {
  const isCurrentAudioSource = (audioInputDevice: MediaDeviceInfoJSON) =>
    audioInputDevice.label === currentAudioSource?.label;
  const currentDeviceId = audioInputDevices.find(isCurrentAudioSource)?.deviceId;
  return currentDeviceId ?? '';
};

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
