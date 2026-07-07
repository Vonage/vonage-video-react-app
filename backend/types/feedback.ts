/**
 * Maximum length of the base64-encoded attachment string (~1.5 MB decoded).
 * Bounds the payload before it is decoded into a Buffer to avoid excessive
 * memory allocation from oversized uploads.
 */
export const MAX_ATTACHMENT_BASE64_LENGTH = 2_000_000;

export type FeedbackData = {
  title: string;
  name: string;
  issue: string;
  attachment: string;
  origin: FeedbackOrigin;
};

export type FeedbackOrigin = 'web' | 'iOS' | 'Android';

export type ReportIssueReturn = {
  message: string;
  ticketUrl: string;
  screenshotIncluded?: boolean;
};
