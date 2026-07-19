import { ReactElement } from 'react';
import VividIcon from '@ui/components/VividIcon';

/**
 * DevicePermissionBadge Component
 *
 * A small warning badge overlaid on a device toggle button to signal that the browser has
 * blocked that device — distinguishing a browser-blocked device from one the user simply
 * turned off. Meant to be rendered as a sibling of the (clipped) circular button inside a
 * relatively-positioned container.
 * @returns {ReactElement} - The DevicePermissionBadge component.
 */
const DevicePermissionBadge = (): ReactElement => {
  return (
    <span
      data-testid="device-permission-badge"
      className="pointer-events-none absolute -right-1 -top-1 z-10 flex size-5 items-center justify-center rounded-full bg-vera-error"
    >
      <VividIcon name="warning-line" customSize={-6} style={{ color: 'var(--vera-on-error)' }} />
    </span>
  );
};

export default DevicePermissionBadge;
