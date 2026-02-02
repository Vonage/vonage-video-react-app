/**
 * Helper function to rename a deviceId to `System Default` for any audio output devices
 * @param {AudioOutputDevice} audioOutput - The device to check and rename.
 * @param {string} defaultLabel - Default label translated
 * @returns {AudioOutputDevice} - The renamed device or the original device
 */
export default (audioOutput: MediaDeviceInfo, defaultLabel = 'System Default'): MediaDeviceInfo =>
  audioOutput.deviceId === 'default' ? { ...audioOutput, label: defaultLabel } : audioOutput;
