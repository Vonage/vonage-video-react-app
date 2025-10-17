import { AudioOutputDevice, Device } from '@vonage/client-sdk-video';

/**
 * Cleans up device labels from navigator.mediaDevices by removing technical identifiers
 * while preserving useful descriptive information.
 * @param {string} label - The original device label from (Device | AudioOutputDevice).label
 * @returns {string} The cleaned device label
 */
const cleanDeviceLabel = (label: string): string => {
  if (!label || typeof label !== 'string') {
    return '';
  }

  return (
    label
      // Remove macOS/iOS device IDs: (0000:0001), (1a2b:3c4d)
      .replace(/\s{0,32}\([0-9A-Fa-f]{4}:[0-9A-Fa-f]{4}\)$/g, '')

      // Remove Windows USB device paths: (USB\VID_1234&PID_5678...)
      .replace(/\s{0,32}\(USB\\VID_[0-9A-F]{4}&PID_[0-9A-F]{4}[^)]{0,128}\)$/gi, '')

      // Remove Linux USB bus info: (usb-0000:00:1d.0-1)
      .replace(/\s{0,32}\(usb-[0-9A-Fa-f:.-]{1,64}\)$/gi, '')

      // Remove generic bus info patterns: (pci-0000:00:1b.0)
      .replace(/\s{0,32}\([a-z]{2,8}-[0-9A-Fa-f:.-]{1,64}\)$/gi, '')

      // Remove simple numeric IDs: (1), (2), (0)
      .replace(/\s{0,32}\(\d{1,6}\)$/g, '')

      // Remove Chrome's camera numbering: " - 1", " - 2"
      .replace(/\s{0,8}-\s*\d{1,3}$/g, '')

      // Clean up multiple spaces and normalize
      .replace(/\s+/g, ' ')
      .trim()
  );
};

/**
 * Cleans and deduplicates device labels.
 * If multiple devices have the same cleaned label, they are suffixed with a number.
 * For example, two devices both labeled "Logitech Webcam" become "Logitech Webcam" and "Logitech Webcam (2)".
 * @param {(Device | AudioOutputDevice)[]} devices - The list of media devices.
 * @returns {Array<(Device | AudioOutputDevice)>} The list of devices with cleaned and deduplicated labels.
 */
const cleanAndDedupeDeviceLabels = (
  devices: (Device | AudioOutputDevice)[]
): Array<Device | AudioOutputDevice> => {
  const labelCounts = new Map<string, number>();

  return devices.map((device) => {
    if (!device.label) {
      return device;
    }
    const cleanLabel = cleanDeviceLabel(device.label);

    const currentCount = labelCounts.get(cleanLabel) || 0;
    labelCounts.set(cleanLabel, currentCount + 1);

    const finalLabel = currentCount > 0 ? `${cleanLabel} (${currentCount + 1})` : cleanLabel;

    return {
      ...device,
      label: finalLabel,
    };
  });
};

export default cleanAndDedupeDeviceLabels;
