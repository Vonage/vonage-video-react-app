/**
 * Helper function to determine if a given device is a video input device.
 * @param {MediaDeviceInfo} device - The device to check.
 * @returns {boolean} - true if device is an video input device, else false
 */
export default (device: MediaDeviceInfo): boolean => device.kind === 'videoinput';
