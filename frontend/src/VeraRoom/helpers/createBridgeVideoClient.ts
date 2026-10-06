import { z } from 'zod';
import { createVideoClient, type VideoClient } from '@core/services';

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
  const requestCredentials = CredentialsSchema.parse(credentials);

  return createVideoClient({
    url: entryPoint,
    fetch: (input, init) => fetch(input, { ...init, credentials: requestCredentials }),
  });
}

export default createBridgeVideoClient;
