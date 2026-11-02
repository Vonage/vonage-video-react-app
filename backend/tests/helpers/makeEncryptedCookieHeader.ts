import encryptCookiePayload from '../../routes/auth/helpers/encryptCookiePayload';
import { TEST_AUTH_COOKIE_SECRET } from './testAuthCookieSecret';

function makeEncryptedCookieHeader({ name, payload }: { name: string; payload: unknown }): string {
  return `${name}=${encryptCookiePayload({ payload, secret: TEST_AUTH_COOKIE_SECRET })}`;
}

export default makeEncryptedCookieHeader;
