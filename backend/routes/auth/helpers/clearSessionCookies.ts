import type { Response } from 'express';
import type { EnabledAuthConfig } from '../../../middleware/authMiddleware/schemas/AuthConfig.schema';
import { SIGN_OUT_PATH } from '../constants';
import buildAuthCookieOptions from './buildAuthCookieOptions';

function clearSessionCookies({
  res,
  authConfig,
}: {
  res: Response;
  authConfig: EnabledAuthConfig;
}): void {
  res.clearCookie(
    authConfig.authSessionCookieName,
    buildAuthCookieOptions({ path: '/', maxAge: undefined })
  );
  res.clearCookie(
    authConfig.authIdTokenCookieName,
    buildAuthCookieOptions({ path: SIGN_OUT_PATH, maxAge: undefined })
  );
}

export default clearSessionCookies;
