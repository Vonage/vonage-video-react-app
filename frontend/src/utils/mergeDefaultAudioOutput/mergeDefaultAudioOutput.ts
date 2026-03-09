import type { MediaDeviceInfoJSON } from '@web/types';

export type MergeDefaultAudioOutputResult = {
  devices: MediaDeviceInfoJSON[];
  /**
   * The deviceId of the real device that was matched to the "default" virtual device.
   * Used to correctly show selection state when the store still holds 'default' as the selected ID.
   * Null if no match was found or there was no "default" device.
   */
  systemDefaultDeviceId: string | null;
};

type MergeDefaultAudioOutputArgs = {
  devices: MediaDeviceInfoJSON[];
  systemDefaultLabel: string;
};

/**
 * Merges the Chrome "default" audio output device into the matching actual device.
 *
 * Chrome exposes a virtual device with deviceId "default" and a label like
 * "Default - MacBook Pro Speakers (Built-in)" alongside the real device entry.
 * This function removes that virtual entry and appends a suffix (e.g. "- System Default")
 * to the matched actual device's label, avoiding the duplicated entry in the UI.
 *
 * If no real devices are present (only the virtual "default" exists), the default
 * entry is preserved and renamed to the translated system default label.
 */
const mergeDefaultAudioOutput = ({
  devices,
  systemDefaultLabel,
}: MergeDefaultAudioOutputArgs): MergeDefaultAudioOutputResult => {
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

  // Chrome labels the default device as "Default - <actual device name>".
  // Use exec + slice instead of a capture group to avoid super-linear backtracking.
  const label = defaultDevice.label ?? '';
  const prefixMatch = /^Default\s*-\s*/i.exec(label);
  if (!prefixMatch) {
    return { devices: nonDefaultDevices, systemDefaultDeviceId: null };
  }

  const actualLabel = label.slice(prefixMatch[0].length).trim();
  let systemDefaultDeviceId: string | null = null;

  const mergedDevices = nonDefaultDevices.map((d) => {
    if (d.label === actualLabel) {
      systemDefaultDeviceId = d.deviceId;
      return { ...d, label: `${d.label} - ${systemDefaultLabel}` };
    }
    return d;
  });

  return { devices: mergedDevices, systemDefaultDeviceId };
};

export default mergeDefaultAudioOutput;
