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

/**
 * Merges the Chrome "default" audio output device into the matching actual device.
 *
 * Chrome exposes a virtual device with deviceId "default" and a label like
 * "Default - MacBook Pro Speakers (Built-in)" alongside the real device entry.
 * This function removes that virtual entry and appends a suffix (e.g. "- System Default")
 * to the matched actual device's label, avoiding the duplicated entry in the UI.
 *
 * @param devices - List of audiooutput devices (labels should already be cleaned/deduped).
 * @param systemDefaultLabel - Translated label for "System Default".
 */
const mergeDefaultAudioOutput = (
  devices: MediaDeviceInfoJSON[],
  systemDefaultLabel: string
): MergeDefaultAudioOutputResult => {
  const defaultDevice = devices.find((d) => d.deviceId === 'default');

  if (!defaultDevice) {
    return { devices, systemDefaultDeviceId: null };
  }

  const nonDefaultDevices = devices.filter((d) => d.deviceId !== 'default');

  // Chrome labels the default device as "Default - <actual device name>"
  const match = defaultDevice.label?.match(/^Default\s*-\s*(.+)$/i);
  if (!match) {
    return { devices: nonDefaultDevices, systemDefaultDeviceId: null };
  }

  const actualLabel = match[1].trim();
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
