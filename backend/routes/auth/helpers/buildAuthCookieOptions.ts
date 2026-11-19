import type { CookieOptions } from 'express';

/**
 * The cookies live on the origin of `oidcWebRedirectUri`, so they're `Secure` exactly when that
 * origin is HTTPS; plain-HTTP origins (local dev, a phone on the LAN) would drop `Secure` cookies.
 */
function buildAuthCookieOptions({
  path,
  maxAge,
  oidcWebRedirectUri,
}: {
  path: string;
  maxAge: number | undefined;
  oidcWebRedirectUri: string;
}): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: new URL(oidcWebRedirectUri).protocol === 'https:',
    path,
    ...(maxAge === undefined ? {} : { maxAge }),
  };
}

export default buildAuthCookieOptions;
