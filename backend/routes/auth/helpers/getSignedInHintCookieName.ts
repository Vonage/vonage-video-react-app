import { SIGNED_IN_HINT_COOKIE_SUFFIX } from '../constants';

/**
 * The readable companion of the session cookie. It only tells the UI that someone is signed in;
 * authorization never reads it.
 */
function getSignedInHintCookieName(authSessionCookieName: string): string {
  return `${authSessionCookieName}${SIGNED_IN_HINT_COOKIE_SUFFIX}`;
}

export default getSignedInHintCookieName;
