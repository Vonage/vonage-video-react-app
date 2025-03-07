import isReportIssueEnabled from './isReportIssueEnabled/isReportIssueEnabled';

/**
 * The base URL determined by the current environment.
 * @returns {string}
 */
export const API_URL = window.location.origin.includes('localhost')
  ? 'http://localhost:3345'
  : window.location.origin;

/**
 * An object representing various states for device access.
 * @returns {object}
 * @property {string} PENDING - Status when the access to the device is pending.
 * @property {string} ACCEPTED - Status when the access to the device has been granted.
 * @property {string} REJECTED - Status when the access to the device was denied.
 * @property {string} ACCESS_CHANGED - Status when the access to the device has changed.
 */
export const DEVICE_ACCESS_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  ACCESS_CHANGED: 'accessChanged',
};

/**
 * A message to alert the user that their microphone is muted.
 * @returns {string}
 */
export const MUTED_ALERT_MESSAGE =
  'Are you talking? Your mic is off. Click on the mic to turn it on.';

/**
 * A message to alert the user that their microphone was muted by another participant.
 * @returns {string}
 */
export const FORCE_MUTED_ALERT_MESSAGE =
  'You have been muted by another participant. Click on the mic to unmute yourself.';

/**
 * A user-friendly message alerting the user of publishing issues.
 * @returns {string}
 */
export const PUBLISHING_BLOCKED_CAPTION =
  "We're having trouble connecting you with others in the meeting room. Please check your network and try again.";

/**
 * The text shadow style used for display purposes.
 * @returns {string}
 */
export const TEXT_SHADOW = '[text-shadow:_0_1px_2px_rgb(0_0_0_/_60%)]';

/**
 * The duration in milliseconds for which emojis are displayed.
 * @returns {number}
 */
export const EMOJI_DISPLAY_DURATION = 5_000;

/**
 * The maximum number of characters allowed in the Report Issue form for the title input.
 * @returns {number}
 */
export const REPORT_TITLE_LIMIT = 100;

/**
 * The maximum number of characters allowed in the Report Issue form for the name input.
 * @returns {number}
 */
export const REPORT_NAME_LIMIT = 100;

/**
 * The maximum number of characters allowed in the Report Issue form for the description input.
 * @returns {number}
 */
export const REPORT_DESCRIPTION_LIMIT = 1000;

export type SupportedBrowser = {
  browser: string;
  link: string;
};

/**
 * The browsers supported by Vonage Video API Reference App, and their download links.
 * @returns {SupportedBrowser[]}
 */
export const SUPPORTED_BROWSERS = [
  { browser: 'Chrome', link: 'https://www.google.com/chrome/' },
  { browser: 'Firefox', link: 'https://www.mozilla.org/en-US/firefox/download/' },
  { browser: 'Edge', link: 'https://www.microsoft.com/en-us/edge/download' },
  { browser: 'Opera', link: 'https://www.opera.com/download' },
  { browser: 'Safari', link: 'https://www.apple.com/safari/' },
];

/**
 * The number of buttons used to control the Right Panel. This value determines the number
 * of buttons shown on the right side of the Toolbar.
 * @returns {number} The number of buttons present for the right panel
 */
export const RIGHT_PANEL_BUTTON_COUNT = 3 - (isReportIssueEnabled() ? 0 : 1);
