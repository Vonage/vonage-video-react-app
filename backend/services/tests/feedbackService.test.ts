import { describe, expect, it, beforeAll, afterAll, vi } from 'vitest';
import { FeedbackService } from '../feedbackService';

describe('getFeedbackService', () => {
  const originalEnv = process.env;
  beforeAll(() => {
    vi.resetModules();
    process.env = { ...originalEnv, VIDEO_SERVICE_PROVIDER: 'opentok' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return JiraFeedbackService when asking for a service', async () => {
    const { default: getFeedbackService } = await import('../getFeedbackService');

    const feedbackService: FeedbackService = getFeedbackService();

    expect(feedbackService.constructor.name).toBe('JiraFeedbackService');
  });
});
