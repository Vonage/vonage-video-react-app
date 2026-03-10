import type { MediaDeviceInfoJSON } from '@web/types';

export type MergeDefaultDeviceLabelResult = {
  devices: MediaDeviceInfoJSON[];
  /**
   * The deviceId of the real device that was matched to the "default" virtual device.
   * Used to correctly show selection state when the store still holds 'default' as the selected ID.
   * Null if no match was found or there was no "default" device.
   */
  systemDefaultDeviceId: string | null;
};

type MergeDefaultDeviceLabelArgs = {
  devices: MediaDeviceInfoJSON[];
  systemDefaultLabel: string;
};

/**
 * Merges the Chrome/Safari "default" device into the matching actual device.
 *
 * Chrome and Safari expose a virtual device with deviceId "default" and a label like
 * "Default - MacBook Pro Speakers (Built-in)" alongside the real device entry, for all
 * device kinds (audioinput, audiooutput, videoinput).
 * This function removes that virtual entry and appends a suffix (e.g. "- System Default")
 * to the matched actual device's label, avoiding the duplicated entry in the UI.
 *
 * If no real devices are present (only the virtual "default" exists), the default
 * entry is preserved and renamed to the translated system default label.
 */
const mergeDefaultDeviceLabel = ({
  devices,
  systemDefaultLabel,
}: MergeDefaultDeviceLabelArgs): MergeDefaultDeviceLabelResult => {
  const defaultDevice = devices.find((d) => d.deviceId === 'default');

  if (!defaultDevice) {
    return { devices, systemDefaultDeviceId: null };
  }

  const nonDefaultDevices = devices.filter((d) => d.deviceId !== 'default');

  if (nonDefaultDevices.length === 0) {
    return {
      devices: [{ ...defaultDevice, label: systemDefaultLabel }],
      systemDefaultDeviceId: null,
    };
  }

  // Chrome/Safari labels the default device as "Default - <actual device name>".
  // Use exec + slice instead of a capture group to avoid super-linear backtracking.
  const label = defaultDevice.label ?? '';
  const prefixMatch = /^Default\s*-\s*/i.exec(label);
  if (!prefixMatch) {
    return { devices: nonDefaultDevices, systemDefaultDeviceId: null };
  }

  const actualLabel = label.slice(prefixMatch[0].length).trim();
  const matchedDevice = nonDefaultDevices.find((d) => d.label === actualLabel) ?? null;

  const mergedDevices = nonDefaultDevices.map((d) =>
    d.label === actualLabel ? { ...d, label: `${d.label} - ${systemDefaultLabel}` } : d
  );
  return { devices: mergedDevices, systemDefaultDeviceId: matchedDevice?.deviceId ?? null };
};

export default mergeDefaultDeviceLabel;
