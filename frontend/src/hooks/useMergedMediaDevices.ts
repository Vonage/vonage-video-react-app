import { useTranslation } from 'react-i18next';
import { useDistinctLabelMediaDevices } from '@ui/hooks';
import type { MediaDeviceInfoJSON } from '@web/types';
import mergeDefaultDeviceLabel from '@web/helpers/mergeDefaultDeviceLabel';
import type { MergeDefaultDeviceLabelResult } from '@web/helpers/mergeDefaultDeviceLabel';
import translateMediaDeviceLabel from '@web/helpers/translateMediaDeviceLabel';

/**
 * Returns cleaned, distinct media devices for a given kind with Chrome/Safari's virtual
 * "default" device merged into the matching real device and OS-level label strings translated.
 *
 * Chrome and Safari expose a virtual device with `deviceId="default"` alongside the real device.
 * This hook removes that virtual entry, finds the matching real device by stripping the
 * "Default - " prefix from its label, and appends the translated system-default suffix
 * (e.g. "MacBook Pro Speakers (Built-in) - System Default").
 *
 * OS strings such as "Built-in" and the "Default" prefix are translated via i18n automatically —
 * no translation props required. Language changes are tracked internally.
 *
 * @param kind - The type of media device ('audioinput', 'videoinput', 'audiooutput').
 * @param selector - Optional transform applied to devices before merging (e.g. unknown-device label fallback).
 * @returns `{ devices, systemDefaultDeviceId }` — merged device list and the real deviceId that maps to the system default.
 */
function useMergedMediaDevices(
  kind: MediaDeviceKind,
  selector?: (devices: MediaDeviceInfoJSON[]) => MediaDeviceInfoJSON[]
): MergeDefaultDeviceLabelResult {
  const { t, i18n } = useTranslation();

  return useDistinctLabelMediaDevices<MergeDefaultDeviceLabelResult>(
    kind,
    (devices) => {
      const selected = selector ? selector(devices) : devices;
      const merged = mergeDefaultDeviceLabel({
        devices: selected,
        systemDefaultLabel: t('devices.defaultLabel'),
      });
      return {
        ...merged,
        devices: merged.devices.map((d) => ({
          ...d,
          label: d.label ? translateMediaDeviceLabel({ label: d.label, translate: t }) : d.label,
        })),
      };
    },
    { dependencies: [i18n.language] }
  );
}

export default useMergedMediaDevices;
