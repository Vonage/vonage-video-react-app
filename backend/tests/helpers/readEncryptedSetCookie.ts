import type { z } from 'zod';
import decryptCookiePayload from '../../routes/auth/helpers/decryptCookiePayload';
import { TEST_AUTH_COOKIE_SECRET } from './testAuthCookieSecret';
import readSetCookie from './readSetCookie';

function readEncryptedSetCookie<Schema extends z.ZodType>({
  headers,
  name,
  schema,
}: {
  headers: Record<string, unknown>;
  name: string;
  schema: Schema;
}): z.infer<Schema> | undefined {
  const setCookie = readSetCookie({ headers, name });
  const value = setCookie?.split(';')[0].slice(name.length + 1);

  return decryptCookiePayload({ value, secret: TEST_AUTH_COOKIE_SECRET, schema });
}

export default readEncryptedSetCookie;
