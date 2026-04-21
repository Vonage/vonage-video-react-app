import type { MediaDeviceInfoJSON } from '@web/types';

type MergeAudioDeviceLabelResult = {
  devices: MediaDeviceInfoJSON[];
  systemDefaultId: string | null;
};

/**
 * Merges the browser's virtual 'default' audio output device into the matching physical device.
 *
 * Chrome and Edge enumerate a deviceId='default' entry whose groupId matches the current system
 * default physical device. This function removes the virtual entry and appends
 * " - {systemDefaultLabel}" to the matching physical device's label, matching the pattern used
 * by Google Meet and Webex.
 *
 * When groupId is empty (e.g. before media permissions are granted), the merge is skipped and
 * the original device list is returned unchanged to avoid incorrect annotation.
 */
const mergeAudioDeviceLabel = (
  devices: MediaDeviceInfoJSON[],
  systemDefaultLabel: string
): MergeAudioDeviceLabelResult => {
  const defaultDevice = devices.find((d) => d.deviceId === 'default');

  if (!defaultDevice) {
    return { devices, systemDefaultId: null };
  }

  if (!defaultDevice.groupId) {
    return { devices, systemDefaultId: null };
  }

  const nonDefaultDevices = devices.filter((d) => d.deviceId !== 'default');
  const matchingDevice = nonDefaultDevices.find((d) => d.groupId === defaultDevice.groupId);

  if (!matchingDevice) {
    return { devices: nonDefaultDevices, systemDefaultId: null };
  }

  const mergedDevices = nonDefaultDevices.map((d) =>
    d.deviceId === matchingDevice.deviceId
      ? { ...d, label: `${d.label} - ${systemDefaultLabel}` }
      : d
  );

  return { devices: mergedDevices, systemDefaultId: matchingDevice.deviceId };
};

export default mergeAudioDeviceLabel;
