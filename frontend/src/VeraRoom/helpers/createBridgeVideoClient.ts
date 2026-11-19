import { z } from 'zod';
import { createVideoClient, type VideoClient } from '@core/services';

const DEFAULT_CREDENTIALS = 'include';

const CredentialsSchema = z.enum(['include', 'same-origin', 'omit']);

/**
 * Builds the video client from the element's `entry-point` and `credentials` attributes. There is
 * no 401 redirect here: the host page owns sign-in.
 */
function createBridgeVideoClient({
  entryPoint,
  credentials,
}: {
  entryPoint: string;
  credentials: string;
}): VideoClient {
  const parsedCredentials = CredentialsSchema.safeParse(credentials);

  if (!parsedCredentials.success) {
    console.warn(
      `<vera-room>: invalid credentials "${credentials}", expected include, same-origin or omit; using "${DEFAULT_CREDENTIALS}"`
    );
  }

  const requestCredentials = parsedCredentials.success
    ? parsedCredentials.data
    : DEFAULT_CREDENTIALS;

  return createVideoClient({
    url: entryPoint,
    fetch: (input, init) => fetch(input, { ...init, credentials: requestCredentials }),
  });
}

export default createBridgeVideoClient;
