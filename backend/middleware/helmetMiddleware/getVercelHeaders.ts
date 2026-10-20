import helmet from 'helmet';
import { ServerResponse } from 'node:http';
import type { IncomingMessage } from 'node:http';
import getHelmetOptions from './getHelmetOptions';

/** Derive the CDN policy from the same production Helmet options as Express. */
function getVercelHeaders(): Record<string, string> {
  const request = {} as IncomingMessage;
  const response = new ServerResponse(request);
  helmet(getHelmetOptions({ isDevelopment: false }))(request, response, () => {});

  return {
    ...Object.fromEntries(
      Object.entries(response.getHeaders()).map(([name, value]) => [name, String(value)])
    ),
    'X-Robots-Tag': 'noindex, nofollow',
  };
}

export default getVercelHeaders;
