import { isMobile } from '@web/platform';
import { env } from '../../env';

/**
 * Whether the screenshare button can be displayed.
 *
 * Screensharing relies on the getDisplayMedia browser API which is unsupported on mobile devices.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia#browser_compatibility
 * @returns {boolean} - true when screensharing is allowed and supported by the current device
 */
const shouldDisplayScreenShareButton = (): boolean => !isMobile() && env.ALLOW_SCREEN_SHARE;

export default shouldDisplayScreenShareButton;
