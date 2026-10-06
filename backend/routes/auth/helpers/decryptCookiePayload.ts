import { createDecipheriv } from 'node:crypto';
import type { z } from 'zod';
import tryCatch from '@common/execution/tryCatch';
import { COOKIE_PAYLOAD_VERSION } from './cookiePayloadFormat';

/**
 * Returns undefined for a missing, tampered or malformed payload, or one of the wrong shape;
 * callers treat that the same as a missing cookie.
 */
function decryptCookiePayload<Schema extends z.ZodType>({
  value,
  secret,
  schema,
}: {
  value: string | undefined;
  secret: string;
  schema: Schema;
}): z.infer<Schema> | undefined {
  if (!value) return undefined;

  const [version, initializationVector, ciphertext, authenticationTag] = value.split('.');

  const hasExpectedFormat =
    version === COOKIE_PAYLOAD_VERSION &&
    !!initializationVector &&
    !!ciphertext &&
    !!authenticationTag;

  if (!hasExpectedFormat) return undefined;

  const { result: plaintext } = tryCatch(() => {
    const decipher = createDecipheriv(
      'aes-256-gcm',
      Buffer.from(secret, 'base64'),
      Buffer.from(initializationVector, 'base64url')
    );
    decipher.setAuthTag(Buffer.from(authenticationTag, 'base64url'));

    return Buffer.concat([
      decipher.update(Buffer.from(ciphertext, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  });

  if (plaintext === null) return undefined;

  const { result: parsedJson } = tryCatch((): unknown => JSON.parse(plaintext));
  const parsedPayload = schema.safeParse(parsedJson);

  return parsedPayload.success ? parsedPayload.data : undefined;
}

export default decryptCookiePayload;
