import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import { decodeSessionKey } from '@common/helpers';
import { SessionKeyClaim } from '@common/constants';
import { errorHandler } from '../middleware/errorHandler';
import mockVonageVideoSdk from './helpers/mockVonageVideoSdk';

await mockVonageVideoSdk();
const videoRouter = (await import('../routes/video')).default;

describe('createSession with a room name and a schedule', () => {
  it('signs both into a new key instead of reusing the room key', async () => {
    expect.assertions(4);
    const app = express();
    app.use(express.json());
    app.use('/v2', videoRouter);
    app.use(errorHandler);
    const roomName = 'weekly-sync';
    const startsAt = Date.UTC(2030, 0, 15, 9, 30);

    const roomKeyResponse = await request(app).post('/v2/createSession').send({ roomName });
    const scheduledResponse = await request(app)
      .post('/v2/createSession')
      .send({ roomName, schedule: { startsAt, durationMinutes: 120 } });

    const roomKeyAfterScheduledResponse = await request(app)
      .post('/v2/createSession')
      .send({ roomName });

    expect(roomKeyAfterScheduledResponse.body.result.data.sessionKey).toEqual(
      roomKeyResponse.body.result.data.sessionKey
    );

    const sessionKey = scheduledResponse.body.result.data.sessionKey as string;
    const scheduledSession = decodeSessionKey({ sessionKey });
    expect(sessionKey).not.toEqual(roomKeyResponse.body.result.data.sessionKey);
    expect(scheduledSession.roomName).toEqual(roomName);
    expect(scheduledSession).toMatchObject({
      [SessionKeyClaim.schedule]: { startsAtMs: startsAt, endsAtMs: startsAt + 120 * 60 * 1000 },
    });
  });
});

describe('createSession with a schedule that has already ended', () => {
  it('refuses it with a 400', async () => {
    const app = express();
    app.use(express.json());
    app.use('/v2', videoRouter);
    app.use(errorHandler);
    const startsAt = Date.now() - 2 * 60 * 60 * 1000;

    const response = await request(app)
      .post('/v2/createSession')
      .send({ schedule: { startsAt, durationMinutes: 60 } });

    expect(response.statusCode).toEqual(400);
    expect(response.body.error.issues).toEqual([
      expect.objectContaining({
        message: 'The schedule has already ended, choose an end time in the future',
      }),
    ]);
  });
});
