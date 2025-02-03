import { Device } from '@vonage/client-sdk-video';
import { UAParser } from 'ua-parser-js';

/**
 * Returns a CSS background style based on the audio level input received.
 * The color transitions from a solid blue fill to transparent depending on the audio level.
 * @param {number} level - The audio level received by the microphone.
 * @returns {string} - A CSS background style string.
 */
export const getBackgroundGradient = (level: number) => {
  const fillPercentage = level; // level is already from 0 to 100
  return `linear-gradient(to top, rgba(26,115,232,.9) ${fillPercentage}%, transparent ${fillPercentage}%)`;
};

/**
 * Returns the device ID for the current audio input source.
 * @param {Device[]} audioInputDevices - An array of audio input devices.
 * @param {MediaStreamTrack} currentAudioSource - The current audio source.
 * @returns {string} - Returns device ID for the matching audio input device, or an empty string if there is no match or the input parameters are invalid.
 */
export const getAudioSourceDeviceId = (
  audioInputDevices: Device[],
  currentAudioSource: MediaStreamTrack
): string => {
  const isCurrentAudioSource = (audioInputDevice: Device) =>
    audioInputDevice.label === currentAudioSource?.label;
  const currentDeviceId = audioInputDevices.find(isCurrentAudioSource)?.deviceId;
  return currentDeviceId ?? '';
};

/**
 * Checks if the current browser is WebKit.
 * @returns {boolean} - Returns `true` if the current browser is WebKit, else `false`.
 */
export const isWebKit = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('safari') && !userAgent.includes('chrome');
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
 * Checks if the current device is mobile.
 * @returns {boolean} - Returns `true` if the current device is mobile, else `false`.
 */
export const isMobile = (): boolean => {
  const { userAgent } = navigator;
  const { device } = UAParser(userAgent);

  return device.type === 'mobile';
};
