import { describe, expect, it } from '@jest/globals';
import { z } from 'zod';
import encryptCookiePayload from './encryptCookiePayload';
import decryptCookiePayload from './decryptCookiePayload';
import { TEST_AUTH_COOKIE_SECRET } from '../../../tests/helpers/testAuthCookieSecret';

const PayloadSchema = z.object({ accessToken: z.string() });

const encrypt = () =>
  encryptCookiePayload({ payload: { accessToken: 'token-1' }, secret: TEST_AUTH_COOKIE_SECRET });

describe('cookie payload encryption', () => {
  it('decrypts what it encrypted', () => {
    expect(
      decryptCookiePayload({
        value: encrypt(),
        secret: TEST_AUTH_COOKIE_SECRET,
        schema: PayloadSchema,
      })
    ).toEqual({ accessToken: 'token-1' });
  });

  it('rejects a tampered payload', () => {
    const [version, initializationVector, ciphertext, tag] = encrypt().split('.');
    const tamperedCiphertext = `${ciphertext.startsWith('A') ? 'B' : 'A'}${ciphertext.slice(1)}`;
    const value = [version, initializationVector, tamperedCiphertext, tag].join('.');

    expect(
      decryptCookiePayload({ value, secret: TEST_AUTH_COOKIE_SECRET, schema: PayloadSchema })
    ).toBeUndefined();
  });

  it('rejects a payload encrypted with another secret', () => {
    const otherSecret = Buffer.alloc(32, 9).toString('base64');

    expect(
      decryptCookiePayload({ value: encrypt(), secret: otherSecret, schema: PayloadSchema })
    ).toBeUndefined();
  });
});
