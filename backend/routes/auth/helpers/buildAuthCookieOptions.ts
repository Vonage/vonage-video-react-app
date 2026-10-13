import type { CookieOptions } from 'express';
import isVcr from '../../../middleware/isVcr';

function buildAuthCookieOptions({
  path,
  maxAge,
}: {
  path: string;
  maxAge: number | undefined;
}): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isVcr,
    path,
    ...(maxAge === undefined ? {} : { maxAge }),
  };
}

export default buildAuthCookieOptions;
