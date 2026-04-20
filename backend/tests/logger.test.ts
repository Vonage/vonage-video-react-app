import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import axios from 'axios';
import request from 'supertest';
import { Server } from 'node:http';
import mockOpentokConfig from '../helpers/__mocks__/config';

jest.mock('../helpers/config', mockOpentokConfig);

jest.mock('axios');

// This needs to be set before the server is imported
process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
const startServer = (await import('../server')).default as (port?: number) => Promise<Server>;

const createValidLogPayload = (overrides?: Record<string, unknown>) => ({
  action: 'EnterMeeting',
  variation: 'Success',
  sessionId: 's1',
  connectionId: 'c1',
  partnerId: 'apiKey',
  clientSystemTime: Date.now(),
  source: 'https://example.com',
  guid: crypto.randomUUID(),
  userAgent: 'Mozilla/5.0',
  level: 'info' as const,
  ...overrides,
});

describe('POST /client-logs', () => {
  let server: Server;
  const mockPost = jest.spyOn(axios, 'post');

  beforeAll(async () => {
    server = await startServer(0);
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    mockPost.mockClear();
    mockPost.mockResolvedValue({ status: 200 });
  });

  it('returns 204 and forwards valid payload to Gollum', async () => {
    const payload = createValidLogPayload({
      action: 'vonageVideoClient.connect.success',
      sessionId: 's1',
      connectionId: 'c1',
    });

    const res = await request(server)
      .post('/client-logs')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(res.statusCode).toEqual(204);
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith(
      'https://example.com',
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
        serverReceivedTime: expect.any(Number),
      }),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      })
    );
  });

  it('returns 400 for invalid payload (missing required fields)', async () => {
    const res = await request(server)
      .post('/client-logs')
      .set('Content-Type', 'application/json')
      .send({
        action: 'SomeAction',
        // missing: clientSystemTime, source, guid, userAgent, level
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toMatchObject({
      message: 'Invalid log payload',
      severity: 'error',
      statusCode: 400,
      issues: expect.any(Array),
    });
    expect(res.body.issues.length).toBeGreaterThan(0);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid level', async () => {
    const res = await request(server)
      .post('/client-logs')
      .set('Content-Type', 'application/json')
      .send(
        createValidLogPayload({
          level: 'debug',
        })
      );

    expect(res.statusCode).toEqual(400);
    expect(res.body).toMatchObject({
      message: 'Invalid log payload',
      severity: 'error',
      statusCode: 400,
      issues: expect.any(Array),
    });
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('returns 400 for empty body', async () => {
    const res = await request(server)
      .post('/client-logs')
      .set('Content-Type', 'application/json')
      .send({});

    expect(res.statusCode).toEqual(400);
    expect(res.body).toMatchObject({
      message: 'Invalid log payload',
      severity: 'error',
      statusCode: 400,
      issues: expect.any(Array),
    });
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('forwards payload with optional fields when present', async () => {
    const payload = createValidLogPayload({
      payload: { error: { message: 'Something broke' } },
      partnerId: '100',
      componentId: 'comp-1',
      name: 'MeetingComponent',
    });

    const res = await request(server)
      .post('/client-logs')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(res.statusCode).toEqual(204);
    expect(mockPost).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        payload: { error: { message: 'Something broke' } },
        partnerId: '100',
        componentId: 'comp-1',
        name: 'MeetingComponent',
      }),
      expect.any(Object)
    );
  });
});

describe('POST /client-logs/batch', () => {
  let server: Server;
  const mockPost = jest.spyOn(axios, 'post');

  beforeAll(async () => {
    server = await startServer(0);
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    mockPost.mockClear();
    mockPost.mockResolvedValue({ status: 200 });
  });

  it('returns 204 and forwards each event in a valid batch', async () => {
    const batch = [
      createValidLogPayload({
        action: 'vonageVideoClient.connect.success',
        sessionId: 's1',
        connectionId: 'c1',
      }),
      createValidLogPayload({ action: 'EnterMeeting', sessionId: 's2', connectionId: 'c2' }),
    ];

    const res = await request(server)
      .post('/client-logs/batch')
      .set('Content-Type', 'application/json')
      .send(batch);

    expect(res.statusCode).toEqual(204);
    expect(mockPost).toHaveBeenCalledTimes(batch.length);
  });

  it('returns 400 when one event in the batch is invalid', async () => {
    const batch = [
      createValidLogPayload(),
      { action: 'SomeAction' }, // missing required fields
    ];

    const res = await request(server)
      .post('/client-logs/batch')
      .set('Content-Type', 'application/json')
      .send(batch);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toMatchObject({
      message: 'Invalid log batch payload',
      severity: 'error',
      statusCode: 400,
      issues: expect.any(Array),
    });
    expect(res.body.issues.length).toBeGreaterThan(0);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('returns 400 when body is not an array', async () => {
    const res = await request(server)
      .post('/client-logs/batch')
      .set('Content-Type', 'application/json')
      .send(createValidLogPayload());

    expect(res.statusCode).toEqual(400);
    expect(res.body).toMatchObject({
      message: 'Invalid log batch payload',
      severity: 'error',
      statusCode: 400,
      issues: expect.any(Array),
    });
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('returns 400 for empty body', async () => {
    const res = await request(server)
      .post('/client-logs/batch')
      .set('Content-Type', 'application/json')
      .send({});

    expect(res.statusCode).toEqual(400);
    expect(res.body).toMatchObject({
      message: 'Invalid log batch payload',
      severity: 'error',
      statusCode: 400,
      issues: expect.any(Array),
    });
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('returns 400 when an event in the batch has an invalid level', async () => {
    const batch = [createValidLogPayload(), createValidLogPayload({ level: 'debug' })];

    const res = await request(server)
      .post('/client-logs/batch')
      .set('Content-Type', 'application/json')
      .send(batch);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toMatchObject({
      message: 'Invalid log batch payload',
      severity: 'error',
      statusCode: 400,
      issues: expect.any(Array),
    });
    expect(mockPost).not.toHaveBeenCalled();
  });
});
