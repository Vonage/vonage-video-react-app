import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import VividIcon from '@ui/components/VividIcon';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import { hasDeniedDevice } from '@utils/publisher/deviceAccess';
import deniedDevicesLabel from '@utils/publisher/deniedDevicesLabel';

/**
 * DeviceAccessHint Component
 *
 * Google Meet-style inline hint shown over the waiting-room preview when the browser has
 * blocked the camera and/or microphone. It names the specific blocked device(s) and points
 * the user at their browser settings, replacing the previous full-screen blocking alert.
 * Renders nothing when no device is blocked.
 * @returns {ReactElement | false} - The DeviceAccessHint pill, or false when nothing is blocked.
 */
const DeviceAccessHint = (): ReactElement | false => {
  const { t } = useTranslation();
  const { deniedDevices } = usePreviewPublisherContext();

  if (!hasDeniedDevice(deniedDevices)) {
    return false;
  }

  const device = deniedDevicesLabel(deniedDevices, t);

  return (
    <div
      data-testid="device-access-hint"
      role="alert"
      className="absolute left-1/2 top-3 z-10 flex max-w-[90%] -translate-x-1/2 items-center gap-2 rounded-vera-medium bg-vera-alert-background px-3 py-1.5 text-vera-caption text-vera-alert-text animate-fade-in"
    >
      <VividIcon name="warning-line" customSize={-6} style={{ color: 'var(--vera-error)' }} />
      <span>{t('deviceAccessHint.blocked', { device })}</span>
    </div>
  );
};

export default DeviceAccessHint;
