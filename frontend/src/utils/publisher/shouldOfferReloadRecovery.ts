import { isWebKit } from '@web/platform';
import isFirefox from '@web/platform/isFirefox';

/**
 * Whether to offer the "reload the page" recovery affordance for a browser-blocked camera/microphone.
 *
 * On Chromium (Chrome, Edge) a reload is never needed: once the user re-allows a blocked device via
 * the address-bar camera/mic icon or site settings, a `permissions.onchange` watcher re-acquires the
 * publisher in place. (Note: clicking the badge cannot re-prompt an explicitly *blocked* device on
 * any browser — Chrome auto-rejects a 'denied' permission with no prompt; re-prompt only works while
 * the permission is still in the 'prompt' state.) Safari (WebKit) and Firefox do NOT fire `onchange`
 * for camera/microphone and stop prompting once blocked, so a manual page reload is the only in-app
 * way back.
 * @returns {boolean} True on Safari/Firefox (reload is the recovery), false on Chromium.
 */
const shouldOfferReloadRecovery = (): boolean => isWebKit() || isFirefox();

export default shouldOfferReloadRecovery;
