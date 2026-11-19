import { env } from '../env';

/**
 * Whether the page has a signed-in user. The backend writes a readable `<session cookie>-signed-in`
 * hint next to the session cookie; it only steers the UI and grants nothing.
 * @returns {boolean} true when auth is disabled or the signed-in hint cookie is present.
 */
const isSignedIn = (): boolean =>
  !env.AUTH_ENABLED ||
  document.cookie.split('; ').some((cookie) => cookie.endsWith('-signed-in=1'));

export default isSignedIn;
