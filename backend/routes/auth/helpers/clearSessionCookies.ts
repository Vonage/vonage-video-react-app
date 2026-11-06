import type { Response } from 'express';
import type { EnabledAuthConfig } from '../../../middleware/authMiddleware/schemas/AuthConfig.schema';
import { SIGN_OUT_PATH, SIGNED_IN_HINT_COOKIE_SUFFIX } from '../constants';
import buildAuthCookieOptions from './buildAuthCookieOptions';

function clearSessionCookies({
  res,
  authConfig,
}: {
  res: Response;
  authConfig: EnabledAuthConfig;
}): void {
  const { oidcWebRedirectUri } = authConfig;

  res.clearCookie(
    authConfig.authSessionCookieName,
    buildAuthCookieOptions({ path: '/', maxAge: undefined, oidcWebRedirectUri })
  );
  res.clearCookie(`${authConfig.authSessionCookieName}${SIGNED_IN_HINT_COOKIE_SUFFIX}`, {
    ...buildAuthCookieOptions({ path: '/', maxAge: undefined, oidcWebRedirectUri }),
    httpOnly: false,
  });
  res.clearCookie(
    authConfig.authIdTokenCookieName,
    buildAuthCookieOptions({ path: SIGN_OUT_PATH, maxAge: undefined, oidcWebRedirectUri })
  );
}

export default clearSessionCookies;
