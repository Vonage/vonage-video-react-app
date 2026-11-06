import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { tryCatch } from '@common/execution';
import mockVonageVideoSdk from './helpers/mockVonageVideoSdk';
import type { RequestWithTokenAuth } from '../middleware/authMiddleware/authMiddleware';

const config = vi.hoisted(() => ({ authEnabled: true }));

vi.doMock('../helpers/config', () => ({
  default: () => ({ authEnabled: config.authEnabled }),
}));

await mockVonageVideoSdk();

const { videoHandler } = await import('../routes/video');

const signedInUser = { active: true, sub: 'user-1', client_id: 'test-client-id' };

function makeCaller({ user }: { user?: typeof signedInUser }) {
  return videoHandler.router$.createCaller({
    req: { user } as RequestWithTokenAuth,
    res: {} as Response,
    videoClient: videoHandler.makeVideoClient$(),
  });
}

async function createRunningSessionKey() {
  const { sessionKey } = await makeCaller({ user: signedInUser }).createSession({
    roomName: 'extend-room',
    schedule: { startsAt: Date.now() - 60 * 1000, durationMinutes: 60 },
  });

  return sessionKey;
}

describe('extendSession access', () => {
  beforeEach(() => {
    config.authEnabled = true;
  });

  it.each([
    { caller: 'a signed-in user with auth enabled', isAuthEnabled: true, user: signedInUser },
    { caller: 'anyone with auth disabled', isAuthEnabled: false, user: undefined },
  ])('lets $caller extend a running meeting', async ({ isAuthEnabled, user }) => {
    config.authEnabled = isAuthEnabled;
    const sessionKey = await createRunningSessionKey();

    const extendedSession = await makeCaller({ user }).extendSession({ sessionKey, minutes: 20 });

    expect(extendedSession.grant).toEqual(expect.any(String));
  });

  it('refuses an anonymous caller with auth enabled, who can still renew with a grant', async () => {
    const sessionKey = await createRunningSessionKey();
    const { grant } = await makeCaller({ user: signedInUser }).extendSession({
      sessionKey,
      minutes: 20,
    });
    const anonymousCaller = makeCaller({});

    const { error } = await tryCatch(() =>
      anonymousCaller.extendSession({ sessionKey, minutes: 20 })
    );
    const renewedSession = await anonymousCaller.renewSessionKey({ sessionKey, grant });

    expect(error).toMatchObject({ cause: { statusCode: 401 } });
    expect(renewedSession.sessionKey).not.toEqual(sessionKey);
  });
});
