import { createVideoClient } from '@core/services';
import { env } from '../env';
import redirectToAuthProvider from './auth/redirectToAuthProvider';

/**
 * Sends cookies cross-port to the backend (session cookie lives on the frontend's origin,
 * server CORS already allows credentialed requests) and hands a 401 over to
 * redirectToAuthProvider, which never settles, so the error page doesn't flash before the
 * navigation.
 */
export const fetchWithAuthRedirect = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const response = await fetch(input, { ...init, credentials: 'include' });

  if (response.status === 401) return redirectToAuthProvider();

  return response;
};

const videoClient = createVideoClient({
  url: `${env.API_URL}/v2`,
  fetch: fetchWithAuthRedirect,
});

export default videoClient;
