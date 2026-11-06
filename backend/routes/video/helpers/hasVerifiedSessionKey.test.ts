import { describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import { VideoClient } from '@api-lib';
import { DEFAULT_VALID_SESSION_ID } from '../../../tests/helpers/mockVonageVideoSdk';
import hasVerifiedSessionKey from './hasVerifiedSessionKey';

const SIGNING_SECRET = 'test-session-signing-secret';

const videoClient = new VideoClient({
  auth: { authType: 'apiKey', apiKey: 'test-api-key', apiSecret: 'test-api-secret' },
  sessionSigning: { secret: SIGNING_SECRET },
});

describe('hasVerifiedSessionKey', () => {
  it('accepts a sessionKey signed by the video client', () => {
    const sessionKey = jwt.sign({ sessionId: DEFAULT_VALID_SESSION_ID }, SIGNING_SECRET);

    expect(hasVerifiedSessionKey({ input: { sessionKey }, videoClient })).toBe(true);
  });

  it('rejects a sessionKey signed with another secret, or a missing one', () => {
    const forgedSessionKey = jwt.sign({ sessionId: DEFAULT_VALID_SESSION_ID }, 'another-secret');

    expect(hasVerifiedSessionKey({ input: { sessionKey: forgedSessionKey }, videoClient })).toBe(
      false
    );
    expect(hasVerifiedSessionKey({ input: { roomName: 'some-room' }, videoClient })).toBe(false);
  });
});
