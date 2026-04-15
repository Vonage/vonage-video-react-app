import axios from 'axios';
import { describe, expect, it, beforeAll, afterAll, jest } from '@jest/globals';
import FormData from 'form-data';
import JiraFeedbackService from '../jiraFeedbackService';
import { FeedbackData, FeedbackOrigin } from '../../types/feedback';

jest.mock('axios');

describe('JiraFeedbackService', () => {
  let jiraFeedbackService: JiraFeedbackService;
  const sharedData = {
    title: 'Nothing works.',
    name: 'John Doe',
    issue: 'This does not even work',
    origin: 'web' as FeedbackOrigin,
  };

  const mockPost = jest.spyOn(axios, 'post');
  const originalEnv = process.env;

  beforeAll(() => {
    jest.resetModules();
    process.env = { ...originalEnv, VIDEO_SERVICE_PROVIDER: 'opentok', JIRA_SEVERITY_ID: '12345' };
    jiraFeedbackService = new JiraFeedbackService();
  });

  afterAll(() => {
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
          customfield_12403: { id: '12345' },
          customfield_26112: 'Reported via user feedback form',
          customfield_13112: sharedData.issue,
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
        key: 'VIDSOL-2024',
      },
    };

    mockPost.mockResolvedValue(mockScreenShotResponse);

    const feedbackService = await jiraFeedbackService.reportIssue(feedbackData);
    expect(feedbackService).toHaveProperty('screenshotIncluded', true);
  });

  it('should create a valid iOS issue and return the issue key', async () => {
    const feedbackData: FeedbackData = {
      ...sharedData,
      attachment: '',
      origin: 'iOS',
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
              id: jiraFeedbackService.jiraiOSComponentId,
            },
          ],
          [jiraFeedbackService.jiraEpicLink]: jiraFeedbackService.jiraEpicUrl,
          customfield_12403: { id: '12345' },
          customfield_26112: 'Reported via user feedback form',
          customfield_13112: sharedData.issue,
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

  it('should throw when the Jira issue key returned is invalid', async () => {
    const feedbackData: FeedbackData = {
      ...sharedData,
      attachment: 'somerandomimagevalues',
    };

    mockPost.mockResolvedValue({ status: 200, data: { key: '2026' } });

    await expect(jiraFeedbackService.reportIssue(feedbackData)).rejects.toThrow(
      'Invalid Jira issue key: 2026'
    );
  });

  it('should throw with Jira error details when the request fails with a 400', async () => {
    const feedbackData: FeedbackData = { ...sharedData, attachment: '' };
    const axiosError = {
      isAxiosError: true,
      message: 'Request failed with status code 400',
      response: {
        data: {
          errors: { customfield_12403: 'Severity is required.' },
        },
      },
    };
    mockPost.mockRejectedValue(axiosError);
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    await expect(jiraFeedbackService.reportIssue(feedbackData)).rejects.toThrow(
      'Jira API error: {"customfield_12403":"Severity is required."}'
    );
  });

  it('should create a valid Android issue and return the issue key', async () => {
    const feedbackData: FeedbackData = {
      ...sharedData,
      attachment: '',
      origin: 'Android',
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
              id: jiraFeedbackService.jiraAndroidComponentId,
            },
          ],
          [jiraFeedbackService.jiraEpicLink]: jiraFeedbackService.jiraEpicUrl,
          customfield_12403: { id: '12345' },
          customfield_26112: 'Reported via user feedback form',
          customfield_13112: sharedData.issue,
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
});
