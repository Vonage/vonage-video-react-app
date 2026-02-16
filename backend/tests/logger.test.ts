/* eslint-disable @typescript-eslint/await-thenable */
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import { Server } from 'http';
import mockOpentokConfig from '../helpers/__mocks__/config';

await jest.unstable_mockModule('../helpers/config', mockOpentokConfig);

const mockForwardToGollum = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);

await jest.unstable_mockModule('../services/gollumClientService', () => ({
  forwardToGollum: mockForwardToGollum,
}));

// This needs to be set before the server is imported
process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
const startServer = (await import('../server')).default;

const createValidLogPayload = (overrides?: Record<string, unknown>) => ({
  action: 'EnterMeeting',
  variation: 'Success',
  clientSystemTime: Date.now(),
  source: 'https://example.com',
  guid: crypto.randomUUID(),
  userAgent: 'Mozilla/5.0',
  level: 'info' as const,
  ...overrides,
});

describe('POST /internal/client-logs', () => {
  let server: Server;

  beforeAll(async () => {
    server = await startServer(0);
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    mockForwardToGollum.mockClear();
  });

  it('returns 200 and forwards valid payload to Gollum', async () => {
    const payload = createValidLogPayload({
      action: 'vonageVideoClient.connect.success',
      sessionId: 's1',
      connectionId: 'c1',
    });

    const res = await request(server)
      .post('/internal/client-logs')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(res.statusCode).toEqual(200);
    expect(mockForwardToGollum).toHaveBeenCalledTimes(1);
    expect(mockForwardToGollum).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'vonageVideoClient.connect.success',
        variation: 'Success',
        sessionId: 's1',
        connectionId: 'c1',
        clientSystemTime: payload.clientSystemTime,
        source: payload.source,
        guid: payload.guid,
        userAgent: payload.userAgent,
        level: 'info',
      })
    );
  });

  it('returns 400 for invalid payload (missing required fields)', async () => {
    const res = await request(server)
      .post('/internal/client-logs')
      .set('Content-Type', 'application/json')
      .send({
        action: 'SomeAction',
        // missing: clientSystemTime, source, guid, userAgent, level
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toMatchObject({ message: 'Invalid log payload', errors: expect.any(Array) });
    expect(res.body.errors.length).toBeGreaterThan(0);
    expect(mockForwardToGollum).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid level', async () => {
    const res = await request(server)
      .post('/internal/client-logs')
      .set('Content-Type', 'application/json')
      .send(
        createValidLogPayload({
          level: 'debug',
        })
      );

    expect(res.statusCode).toEqual(400);
    expect(res.body).toMatchObject({ message: 'Invalid log payload', errors: expect.any(Array) });
    expect(res.body.errors.length).toBeGreaterThan(0);
    expect(mockForwardToGollum).not.toHaveBeenCalled();
  });

  it('returns 400 for empty body', async () => {
    const res = await request(server)
      .post('/internal/client-logs')
      .set('Content-Type', 'application/json')
      .send({});

    expect(res.statusCode).toEqual(400);
    expect(res.body).toMatchObject({ message: 'Invalid log payload', errors: expect.any(Array) });
    expect(res.body.errors.length).toBeGreaterThan(0);
    expect(mockForwardToGollum).not.toHaveBeenCalled();
  });

  it('forwards payload with optional fields when present', async () => {
    const payload = createValidLogPayload({
      payload: { error: { message: 'Something broke' } },
      partnerId: '100',
      componentId: 'comp-1',
      name: 'MeetingComponent',
    });

    const res = await request(server)
      .post('/internal/client-logs')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(res.statusCode).toEqual(200);
    expect(mockForwardToGollum).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: { error: { message: 'Something broke' } },
        partnerId: '100',
        componentId: 'comp-1',
        name: 'MeetingComponent',
      })
    );
  });
});
