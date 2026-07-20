import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import usePublisherContext from '@hooks/usePublisherContext';
import { hasDeniedDevice, NO_DENIED_DEVICES } from '@utils/publisher/deviceAccess';
import deniedDevicesLabel from '@utils/publisher/deniedDevicesLabel';
import shouldOfferReloadRecovery from '@utils/publisher/shouldOfferReloadRecovery';
import PopupAlert from '../PopupAlert';
import DeviceAccessReloadButton from '@components/DeviceAccessReloadButton';

/**
 * DeviceAccessAlert Component
 *
 * In-call counterpart to the waiting room's DeviceAccessHint: a persistent alert shown when the
 * browser has blocked the camera and/or microphone during a meeting. It names the blocked device(s),
 * points the user at their browser settings, and offers a reload — the reliable Safari recovery,
 * since WebKit stops surfacing the permission prompt for a denied device for the rest of the
 * document's lifetime. Renders nothing when no device is blocked.
 * @returns {ReactElement | false} The alert, or false when nothing is blocked.
 */
const DeviceAccessAlert = (): ReactElement | false => {
  const { t } = useTranslation();
  const { deniedDevices } = usePublisherContext();
  const denied = deniedDevices ?? NO_DENIED_DEVICES;

  if (!hasDeniedDevice(denied)) {
    return false;
  }

  const device = deniedDevicesLabel(denied, t);

  return (
    <PopupAlert
      closable
      severity="warning"
      title={t('deviceAccessHint.blockedTitle')}
      message={t('deviceAccessHint.blocked', { device })}
      // Chrome/Edge recover live via a permission onchange watcher once re-allowed in site settings;
      // only Safari/Firefox (no onchange) need a reload.
      action={
        shouldOfferReloadRecovery() ? (
          <DeviceAccessReloadButton className="mt-2 block" />
        ) : undefined
      }
    />
  );
};

export default DeviceAccessAlert;
