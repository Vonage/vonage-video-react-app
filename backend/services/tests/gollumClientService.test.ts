import axios from 'axios';
import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import type { ClientLogEvent } from '@common/logger';
import { forwardToGollum } from '../gollumClientService';

jest.mock('axios');

const createValidClientLogEvent = (overrides?: Partial<ClientLogEvent>): ClientLogEvent => ({
  action: 'EnterMeeting',
  variation: 'Success',
  sessionId: 's1',
  connectionId: 'c1',
  partnerId: 'apiKey',
  clientSystemTime: Date.now(),
  source: 'https://example.com',
  guid: crypto.randomUUID(),
  userAgent: 'Mozilla/5.0',
  level: 'info',
  ...overrides,
});

describe('gollumClientService', () => {
  const mockPost = jest.spyOn(axios, 'post');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should POST to gollumUrl with mapped payload and serverReceivedTime', async () => {
    const event = createValidClientLogEvent({
      action: 'vonageVideoClient.connect.success',
      sessionId: 's1',
      connectionId: 'c1',
      partnerId: '100',
    });

    mockPost.mockResolvedValue({ status: 200 });

    await forwardToGollum(event);

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        action: 'vonageVideoClient.connect.success',
        variation: 'Success',
        sessionId: 's1',
        connectionId: 'c1',
        clientSystemTime: event.clientSystemTime,
        source: event.source,
        guid: event.guid,
        userAgent: event.userAgent,
        partnerId: '100',
        serverReceivedTime: expect.any(Number),
      }),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
        validateStatus: expect.any(Function),
      })
    );
  });

  it('should include payload when present', async () => {
    const event = createValidClientLogEvent({
      payload: { error: { message: 'Something broke', name: 'Error' } },
    });

    mockPost.mockResolvedValue({ status: 200 });

    await forwardToGollum(event);

    expect(mockPost).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        payload: { error: { message: 'Something broke', name: 'Error' } },
      }),
      expect.any(Object)
    );
  });

  it('should reject when axios.post fails (route catches via attempt)', async () => {
    const event = createValidClientLogEvent();

    mockPost.mockRejectedValue(new Error('Network error'));

    await expect(forwardToGollum(event)).rejects.toThrow('Network error');
  });
});
