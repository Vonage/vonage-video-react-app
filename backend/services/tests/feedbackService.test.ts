import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { FeedbackService } from '../feedbackService';

describe('getFeedbackService', () => {
  const originalEnv = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, VIDEO_SERVICE_PROVIDER: 'opentok' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return JiraFeedbackService when asking for a service', async () => {
    const { default: getFeedbackService } = await import('../getFeedbackService');

    const feedbackService: FeedbackService = getFeedbackService();

    expect(feedbackService.constructor.name).toBe('JiraFeedbackService');
  });
});
