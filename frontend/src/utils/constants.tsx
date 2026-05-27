import { env } from '../env';
import isReportIssueEnabled from './isReportIssueEnabled/isReportIssueEnabled';

/**
 * @constant {string} API_URL - The base URL determined by the current environment.
 */
export const API_URL =
  env.API_URL ||
  (window.location.origin.includes('localhost') ? 'http://localhost:3345' : window.location.origin);

/**
 * @constant {object} DEVICE_ACCESS_STATUS - An object representing various states for device access.
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
 * @constant {number} EMOJI_DISPLAY_DURATION - The duration in milliseconds for which emojis are displayed.
 */
export const EMOJI_DISPLAY_DURATION = 5_000;

/**
 * @constant {number} REPORT_TITLE_LIMIT - The maximum number of characters allowed in the Report Issue form for the title input.
 */
export const REPORT_TITLE_LIMIT = 100;

/**
 * @constant {number} REPORT_NAME_LIMIT - The maximum number of characters allowed in the Report Issue form for the name input.
 */
export const REPORT_NAME_LIMIT = 100;

/**
 * @constant {number} REPORT_DESCRIPTION_LIMIT - The maximum number of characters allowed in the Report Issue form for the description input.
 */
export const REPORT_DESCRIPTION_LIMIT = 1000;

/**
 * @constant {object} SupportedBrowser - An object representing the browser name and link to download it
 * @property {string} browser - The browser name.
 * @property {string} link - The link to download the said browser.
 */
export type SupportedBrowser = {
  browser: string;
  link: string;
};

/**
 * @constant {SupportedBrowser[]} SUPPORTED_BROWSERS - The browsers supported by Vonage Video API Reference App, and their download links.
 */
export const SUPPORTED_BROWSERS = [
  { browser: 'Chrome', link: 'https://www.google.com/chrome/' },
  { browser: 'Firefox', link: 'https://www.mozilla.org/en-US/firefox/download/' },
  { browser: 'Edge', link: 'https://www.microsoft.com/en-us/edge/download' },
  { browser: 'Opera', link: 'https://www.opera.com/download' },
  { browser: 'Safari', link: 'https://www.apple.com/safari/' },
];

/**
 * @constant {number} MAX_PIN_COUNT_MOBILE - the maximum number of pinned participants on mobile
 */
export const MAX_PIN_COUNT_MOBILE = 1;
/**
 * @constant {number} MAX_PIN_COUNT_DESKTOP - the maximum number of pinned participants on desktop
 */
export const MAX_PIN_COUNT_DESKTOP = 3;
/**
 * @constant {number} MAX_TILES_GRID_VIEW_DESKTOP - the maximum number of subscriber video tiles in grid view on desktop
 */
export const MAX_TILES_GRID_VIEW_DESKTOP = 11;
/**
 * @constant {number} MAX_TILES_SPEAKER_VIEW_DESKTOP - the maximum number of subscriber video tiles in active-speaker view on desktop
 */
export const MAX_TILES_SPEAKER_VIEW_DESKTOP = 5;
/**
 * @constant {number} MAX_TILES_GRID_VIEW_MOBILE - the maximum number of subscriber video tiles in grid view on mobile
 */
export const MAX_TILES_GRID_VIEW_MOBILE = 3;
/**
 * @constant {number} MAX_TILES_SPEAKER_VIEW_MOBILE - the maximum number of subscriber video tiles in active-speaker view on mobile
 */
export const MAX_TILES_SPEAKER_VIEW_MOBILE = 2;

/**
 * @constant {number} RIGHT_PANEL_BUTTON_COUNT - The number of buttons used to control the Right Panel. This value determines the number
 * of buttons shown on the right side of the Toolbar.
 */
export const RIGHT_PANEL_BUTTON_COUNT = 3 - (isReportIssueEnabled() ? 0 : 1);

/**
 * @constant {number} CAPTION_DISPLAY_DURATION_MS - The duration in milliseconds for which captions are displayed.
 */
export const CAPTION_DISPLAY_DURATION_MS = 4000;

/*
 * @constant {number} SMALL_VIEWPORT - The pixel width threshold used to determine if the viewport is considered small.
 * Typically used as the max-width breakpoint for responsive layouts.
 */
export const SMALL_VIEWPORT = 768;

/*
 * @constant {number} TABLET_VIEWPORT - The pixel width threshold used to determine if the viewport is considered tablet.
 * Typically used as the max-width breakpoint for responsive layouts.
 */
export const TABLET_VIEWPORT = 899;

/*
 * @constant {number} VIDEO_CONTAINER_HEIGHT_WR - The fixed height for the video container in the waiting room.
 */
export const VIDEO_CONTAINER_HEIGHT_WR = 360;

/*
 * @constant {number} VIDEO_CONTAINER_BUTTON_SIZE_WR - The fixed height for the video container buttons in the waiting room.
 */
export const VIDEO_CONTAINER_BUTTON_SIZE_WR = 40;

/**
 * @constant {string} BACKGROUNDS_PATH - The path to the backgrounds assets directory.
 */
export const BACKGROUNDS_PATH = '/background';

/**
 * @constant {number} MAX_SIZE_MB - The maximum file size (in megabytes) allowed for image uploads.
 * Used to validate image uploads in components like AddBackgroundEffectLayout.
 */
export const MAX_SIZE_MB = 2;

/**
 * @constant {string[]} ALLOWED_TYPES - An array of allowed MIME types for image uploads.
 * Used to validate image uploads in components like AddBackgroundEffectLayout.
 */
export const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];

/**
 * @constant {number} MAX_LOCAL_STORAGE_BYTES - The maximum size (in bytes) for storing images in localStorage.
 * This is set to approximately 4MB, which is a common limit for localStorage across browsers.
 */
export const MAX_LOCAL_STORAGE_BYTES = 4 * 1024 * 1024;

/**
 * @constant {number} DEFAULT_SELECTABLE_OPTION_WIDTH - The default size (in pixels) for selectable option elements.
 * Used to define the width of selectable options in UI components.
 */
export const DEFAULT_SELECTABLE_OPTION_WIDTH = 68;

/**
 * @constant {number} MIN_ZOOM - The minimum zoom level for screenshare content.
 * A zoom level of 1 corresponds to 100% (no zoom).
 */
export const MIN_ZOOM = 0.5;

/**
 * @constant {number} MAX_ZOOM - The maximum zoom level for screenshare content.
 * A zoom level of 1 corresponds to 100% (no zoom).
 */
export const MAX_ZOOM = 5;

/**
 * @constant {number} ZOOM_STEP - The incremental step for zooming in or out on screenshare content.
 * This value determines how much the zoom level changes with each zoom action (e.g., mouse wheel event).
 */
export const ZOOM_STEP = 0.25;

/**
 * @constant {number} ABSOLUTE_DISTANCE_THRESHOLD_REM_VALUE - The distance threshold used for absolute positioning of subscriber/publisher UI indicators.
 * This value is defined in rem units to ensure responsiveness across different screen sizes.
 */
export const ABSOLUTE_DISTANCE_THRESHOLD_REM_VALUE = 0.75;

/**
 * @constant {number} RECORDING_POPUP_TIMEOUT_MS - The duration in milliseconds for which the recording consent popup is displayed before automatically closing.
 */
export const RECORDING_POPUP_TIMEOUT_MS = 5000;

/**
 * @constant {number} RECORDING_START_DELAY - The delay in milliseconds before starting the recording after the user initiates it.
 * This delay allows for any necessary setup or confirmation dialogs to be completed before the recording starts.
 */
export const RECORDING_START_DELAY = 3000;
