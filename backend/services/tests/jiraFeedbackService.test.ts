import axios from 'axios';
import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import FormData from 'form-data';
import JiraFeedbackService from '../jiraFeedbackService';
import { FeedbackData } from '../../types/feedback';

jest.mock('axios');

describe('JiraFeedbackService', () => {
  let jiraFeedbackService: JiraFeedbackService;
  const sharedData = {
    title: 'Nothing works.',
    name: 'John Doe',
    issue: 'This does not even work',
  };

  const mockPost = jest.spyOn(axios, 'post');
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, VIDEO_SERVICE_PROVIDER: 'opentok' };
    jiraFeedbackService = new JiraFeedbackService();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create a valid issue and return the issue key', async () => {
    const feedbackData: FeedbackData = {
      ...sharedData,
      attachment: '',
    };

    const mockTicketResponse: { data: { key: string } } = {
      data: {
        key: '2024',
      },
    };

    mockPost.mockResolvedValue(mockTicketResponse);

    await jiraFeedbackService.reportIssue(feedbackData);
    expect(axios.post).toHaveBeenCalledWith(
      jiraFeedbackService.jiraApiUrl,
      {
        fields: {
          project: { key: jiraFeedbackService.jiraKey },
          summary: 'Nothing works.',
          description: 'Reported by: John Doe\n\n Issue description:\nThis does not even work',
          issuetype: { name: 'Bug' },
          components: [
            {
              id: jiraFeedbackService.jiraComponentId,
            },
          ],
          [jiraFeedbackService.jiraEpicLink]: jiraFeedbackService.jiraEpicUrl,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${jiraFeedbackService.jiraToken}`,
        },
      }
    );
  });

  it('should create a valid issue and also include the screenshot if provided', async () => {
    const mockBuffer = Buffer.from('mocked buffer');
    jest.spyOn(Buffer, 'from').mockReturnValue(mockBuffer);
    const formDataMock = new FormData();
    jest.spyOn(formDataMock, 'append');
    jest
      .spyOn(formDataMock, 'getHeaders')
      .mockReturnValue({ 'Content-Type': 'multipart/form-data' });
    const feedbackData: FeedbackData = {
      ...sharedData,
      attachment: 'somerandomimagevalues',
    };

    const mockScreenShotResponse = {
      status: 200,
      data: {
        key: '2024',
      },
    };

    mockPost.mockResolvedValue(mockScreenShotResponse);

    const feedbackService = await jiraFeedbackService.reportIssue(feedbackData);
    expect(feedbackService).toHaveProperty('screenshotIncluded', true);
  });
});
