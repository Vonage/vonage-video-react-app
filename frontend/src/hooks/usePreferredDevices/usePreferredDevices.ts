import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import mediaDevices$ from '@core/stores/devices';
import cleanAndDedupeDeviceLabels from '@utils/cleanAndDedupeDeviceLabels';
import filterMobileCameras from './helpers/filterMobileCameras';

/**
 * React hook that returns filtered and processed media devices for the given kind.
 *
 * For videoinput on mobile: limits to at most one primary front-facing and one primary rear-facing camera,
 * plus any cameras that do not match front/rear label patterns (e.g. USB webcams). This prevents
 * issues with devices that enumerate multiple physical cameras where only one front and one rear
 * camera actually function correctly.
 *
 * For all kinds: applies cleanAndDedupeDeviceLabels so labels are consistent across the app
 * (MeetingRoom, WaitingRoom, etc.), and uses t('unknown.device') as fallback for empty labels.
 *
 * @param kind - The type of media device ('audioinput', 'videoinput', 'audiooutput').
 * @returns Filtered and processed array of devices with cleaned, deduped labels and fallback for empty labels.
 */
function usePreferredDevices(kind: MediaDeviceKind) {
  const { t } = useTranslation();
  const rawDevicesByKind = mediaDevices$.useMediaDevices(kind, (devices) => Object.values(devices));

  return useMemo(() => {
    const devices =
      kind === 'videoinput' ? filterMobileCameras(rawDevicesByKind) : rawDevicesByKind;
    const cleaned = cleanAndDedupeDeviceLabels(devices);
    return cleaned.map((device) => ({
      ...device,
      label: device.label ?? t('unknown.device'),
    }));
  }, [kind, rawDevicesByKind, t]);
}

export default usePreferredDevices;
