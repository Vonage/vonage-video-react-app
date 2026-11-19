import type { Response } from 'express';
import type { EnabledAuthConfig } from '../../../middleware/authMiddleware/schemas/AuthConfig.schema';
import encryptCookiePayload from './encryptCookiePayload';
import buildAuthCookieOptions from './buildAuthCookieOptions';

function writeCookiePayload({
  res,
  name,
  payload,
  path,
  maxAge,
  authConfig: { authCookieSecret, oidcWebRedirectUri },
}: {
  res: Response;
  name: string;
  payload: unknown;
  path: string;
  maxAge: number | undefined;
  authConfig: EnabledAuthConfig;
}): void {
  res.cookie(
    name,
    encryptCookiePayload({ payload, secret: authCookieSecret }),
    buildAuthCookieOptions({ path, maxAge, oidcWebRedirectUri })
  );
}

export default writeCookiePayload;
