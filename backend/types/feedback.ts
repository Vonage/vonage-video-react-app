export type FeedbackData = {
  title: string;
  name: string;
  issue: string;
  attachment: string;
  origin: FeedbackOrigin;
};

export enum FeedbackOrigin {
  Web = 'web',
  iOS = 'iOS',
  Android = 'Android',
}

export type ReportIssueReturn = {
  message: string;
  ticketUrl: string;
  screenshotIncluded?: boolean;
};
