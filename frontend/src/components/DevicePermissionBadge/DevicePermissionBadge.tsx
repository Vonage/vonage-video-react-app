import { ReactElement } from 'react';

/**
 * DevicePermissionBadge Component
 *
 * A small amber alert pip overlaid on a device toggle button to signal that the browser has blocked
 * that device — distinguishing a browser-blocked device from one the user simply turned off. Styled
 * after Google Meet's badge: a filled amber circle with a bold "!" glyph. Meant to be rendered as a
 * sibling of the (clipped) circular button inside a relatively-positioned container.
 *
 * The amber is pinned to the bright warning-dark token (#FA9F00, ~Google Meet amber) in both themes
 * so the badge reads the same everywhere, and the near-black on-warning-dark token gives the "!"
 * high contrast (white on this amber fails contrast). The Vivid icon set has no bare "!" glyph, so
 * it is a text character rather than a VividIcon.
 * @returns {ReactElement} - The DevicePermissionBadge component.
 */
const DevicePermissionBadge = (): ReactElement => {
  return (
    <span
      data-testid="device-permission-badge"
      aria-hidden="true"
      className="pointer-events-none absolute -right-1 -top-1 z-10 flex size-5 items-center justify-center rounded-full bg-vera-warning-dark text-[0.8125rem] font-bold leading-none text-vera-on-warning-dark"
    >
      !
    </span>
  );
};

export default DevicePermissionBadge;
