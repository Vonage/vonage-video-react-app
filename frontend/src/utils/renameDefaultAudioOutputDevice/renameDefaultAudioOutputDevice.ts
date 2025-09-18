import { AudioOutputDevice } from '@vonage/client-sdk-video';

/**
 * Helper function to rename a deviceId to `System Default` for any audio output devices
 * @param {AudioOutputDevice} audioOutput - The device to check and rename.
 * @param {string} defaultLabel - Default label translated
 * @returns {AudioOutputDevice} - The renamed device or the original device
 */
export default (
  audioOutput: AudioOutputDevice,
  defaultLabel = 'System Default'
): AudioOutputDevice =>
  audioOutput.deviceId === 'default' ? { ...audioOutput, label: defaultLabel } : audioOutput;
