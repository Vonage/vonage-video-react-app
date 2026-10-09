import { createCipheriv, randomBytes } from 'node:crypto';
import { COOKIE_PAYLOAD_VERSION } from './cookiePayloadFormat';

/**
 * AES-256-GCM, serialized as `v1.<iv>.<ciphertext>.<tag>` in base64url. The tag authenticates the
 * payload, so a tampered cookie fails to decrypt.
 */
function encryptCookiePayload({ payload, secret }: { payload: unknown; secret: string }): string {
  const initializationVector = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(secret, 'base64'), initializationVector);

  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final(),
  ]);

  return [
    COOKIE_PAYLOAD_VERSION,
    initializationVector.toString('base64url'),
    ciphertext.toString('base64url'),
    cipher.getAuthTag().toString('base64url'),
  ].join('.');
}

export default encryptCookiePayload;
