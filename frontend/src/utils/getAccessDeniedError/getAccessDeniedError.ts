/**
 * @typedef PublishingErrorType - Represents an error message displaying a header and a caption.
 * @property {string} header - The main title of the error message.
 * @property {string} caption - Additional context for the error.
 */
export type PublishingErrorType = {
  header: string;
  caption: string;
};

/**
 * Represents an optional error, which is null if there is no error.
 */
export type PublishingError = null | PublishingErrorType;

export default (device: string): PublishingErrorType => ({
  header: `${device} access is denied`,
  caption: `It seems your browser is blocked from accessing your ${device.toLowerCase()}. Reset the permission state through your browser's UI.`,
});
