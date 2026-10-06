import type { Request } from 'express';
import type { z } from 'zod';
import { getCookieValue } from '@node/helpers';
import decryptCookiePayload from './decryptCookiePayload';

function readCookiePayload<Schema extends z.ZodType>({
  req,
  name,
  secret,
  schema,
}: {
  req: Request;
  name: string;
  secret: string;
  schema: Schema;
}): z.infer<Schema> | undefined {
  const value = getCookieValue({ cookieHeader: req.headers.cookie, name });

  return decryptCookiePayload({ value, secret, schema });
}

export default readCookiePayload;
