import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import closeServer from './helpers/closeServer';
import request from 'supertest';
import { Server } from 'http';
import { ReportIssueReturn } from '../types/feedback';
import mockOpentokConfig from '../helpers/__mocks__/config';

vi.doMock('../helpers/config', mockOpentokConfig);

const mockReportIssue = vi.fn<[], Promise<ReportIssueReturn | null>>().mockResolvedValue({
  message: 'Your Jira ticket has been created.',
  ticketUrl: 'https://jira.com/browse/key-123',
});

vi.doMock('../services/getFeedbackService.ts', () => {
  return {
    default: vi.fn(() => ({
      reportIssue: mockReportIssue,
    })),
  };
});

// This needs to be set before the server is imported
// and the import of the startServer cannot happen inside describe
process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
const startServer = (await import('../server')).default;

describe('POST /feedback/report', () => {
  let server: Server;

  const feedbackPayload = {
    title: 'Audio not working',
    name: 'John Doe',
    issue: 'Cannot hear other participants',
    attachment: '',
  };

  beforeAll(async () => {
    server = await startServer(0);
  });

  afterAll(() => closeServer(server));

  beforeEach(() => {
    mockReportIssue.mockClear();
  });

  it('Posting a feedback should pass correct values to the feedback service', async () => {
    const res = await request(server)
      .post('/feedback/report')
      .set('Content-Type', 'application/json')
      .send(feedbackPayload);

    expect(res.statusCode).toEqual(200);

    expect(mockReportIssue).toHaveBeenCalledTimes(1);

    expect(mockReportIssue).toHaveBeenCalledWith({
      title: 'Audio not working',
      name: 'John Doe',
      issue: 'Cannot hear other participants',
      attachment: '',
      origin: 'web',
    });
  });

  it('Posting a feedback with iOS user agent should pass correct values to the feedback service', async () => {
    const res = await request(server)
      .post('/feedback/report')
      .set('Content-Type', 'application/json')
      .set('User-Agent', 'VeraNativeiOS')
      .send(feedbackPayload);

    expect(res.statusCode).toEqual(200);

    expect(mockReportIssue).toHaveBeenCalledTimes(1);

    expect(mockReportIssue).toHaveBeenCalledWith({
      title: 'Audio not working',
      name: 'John Doe',
      issue: 'Cannot hear other participants',
      attachment: '',
      origin: 'iOS',
    });
  });

  it('Posting a feedback with Android user agent should pass correct values to the feedback service', async () => {
    const res = await request(server)
      .post('/feedback/report')
      .set('Content-Type', 'application/json')
      .set('User-Agent', 'VeraNativeAndroid')
      .send(feedbackPayload);

    expect(res.statusCode).toEqual(200);

    expect(mockReportIssue).toHaveBeenCalledTimes(1);

    expect(mockReportIssue).toHaveBeenCalledWith({
      title: 'Audio not working',
      name: 'John Doe',
      issue: 'Cannot hear other participants',
      attachment: '',
      origin: 'Android',
    });
  });
});
