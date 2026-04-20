import { FeedbackData, ReportIssueReturn } from '../types/feedback';

export interface FeedbackService {
  reportIssue(data: FeedbackData): Promise<ReportIssueReturn>;
}
