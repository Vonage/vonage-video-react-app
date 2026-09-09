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
