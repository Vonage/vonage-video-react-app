/**
 * Helper function to determine if a given device is an audio input device.
 * @param {MediaDeviceInfo} device - The device to check.
 * @returns {boolean} - true if device is an audioInput device, else false
 */
export default (device: MediaDeviceInfo): boolean => device.kind === 'audioinput';
