import { createVideoClient } from '@core/services';
import { env } from '../env';

const AUTH_SIGNIN_PATH = '/auth/signin';

/**
 * Sends cookies cross-port to the backend (session cookie lives on the frontend's origin,
 * server CORS already allows credentialed requests) and redirects to sign-in on a 401 so an
 * expired/missing session sends the user back to Okta instead of a confusing failed request.
 */
export const fetchWithAuthRedirect = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const response = await fetch(input, { ...init, credentials: 'include' });

  if (response.status === 401) {
    const returnTo = `${window.location.pathname}${window.location.search}`;
    window.location.href = `${env.API_URL}${AUTH_SIGNIN_PATH}?returnTo=${encodeURIComponent(returnTo)}`;
  }

  return response;
};

const videoClient = createVideoClient({
  url: `${env.API_URL}/v2`,
  fetch: fetchWithAuthRedirect,
});

export default videoClient;
