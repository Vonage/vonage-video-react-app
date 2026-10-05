import { describe, expect, it, vi } from 'vitest';
import createEphemeralToken from './createEphemeralToken';
import { TokenRole, type IVideoClient } from '@api-lib/types';
import type { CreateEphemeralTokenPayload } from '@api-lib/schemas/CreateEphemeralTokenPayload.schema';

describe('createEphemeralToken', () => {
  it('passes an expireTime in epoch seconds (~30s from now), not milliseconds', () => {
    const generateClientToken = vi.fn().mockReturnValue('token');
    const client = {
      decodeSessionKey: vi.fn().mockReturnValue({ sessionId: 'session-id' }),
      video: { generateClientToken },
    } as unknown as IVideoClient;

    const token = createEphemeralToken.call(client, {
      sessionKey: 'session-key',
    } as CreateEphemeralTokenPayload);

    expect(token).toBe('token');

    const nowSeconds = Math.floor(Date.now() / 1000);
    const tokenOptions = generateClientToken.mock.calls[0][1] as {
      role: string;
      expireTime: number;
    };

    expect(tokenOptions.role).toBe(TokenRole.MODERATOR);
    // The SDK sets the JWT `exp` to this value directly (epoch seconds); the bug
    // passed Date.now() + ms (~1.7e12), making tokens effectively never expire.
    expect(Math.abs(tokenOptions.expireTime - (nowSeconds + 30))).toBeLessThan(5);
    expect(tokenOptions.expireTime).toBeLessThan(1e11);
  });
});
