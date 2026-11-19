import { env } from '../../env';

const SIGN_IN_PATH = '/auth/signin';

let isRedirecting = false;

/**
 * Sends the browser to the backend sign-in route (which forwards to the auth provider) and returns
 * a promise that never settles, so callers awaiting a rejected request don't run their error
 * handling while the page unloads. Parallel 401s navigate only once.
 */
function redirectToAuthProvider(): Promise<never> {
  if (!isRedirecting) {
    isRedirecting = true;

    const returnTo = `${window.location.pathname}${window.location.search}`;
    window.location.assign(
      `${env.API_URL}${SIGN_IN_PATH}?returnTo=${encodeURIComponent(returnTo)}`
    );
  }

  return new Promise<never>(() => {});
}

export default redirectToAuthProvider;
