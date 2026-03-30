import { xmlHttpRequestEnvelop } from '@core/interceptors';
import { env } from '../env';
import { isNil } from '@common/assertions';

declare global {
  interface Window {
    OTProperties?: Record<string, unknown>;
  }
}

const defaultVonageVideoHost = 'https://video.api.vonage.com';

const tryOverrideVonageVideoHost = () => {
  const { VONAGE_VIDEO_HOST } = env;
  if (isNil(VONAGE_VIDEO_HOST)) return;

  /**
   * Override the `open` method of XMLHttpRequest to rewrite requests to the default Vonage Video API host
   * to the one specified in the environment variable. This allows for dynamic switching of the API host
   * without needing to change the codebase or rebuild the application.
   */
  xmlHttpRequestEnvelop.override(
    'open',
    ({ handler }) =>
      function (this: XMLHttpRequest, method, url, ...args) {
        const isVonageVideoHostRequest = url.toString().startsWith(defaultVonageVideoHost);
        if (!isVonageVideoHostRequest) return handler.apply(this, [method, url, ...args]);

        const rewrittenUrl = url.toString().replace(defaultVonageVideoHost, VONAGE_VIDEO_HOST);
        return handler.apply(this, [method, rewrittenUrl, ...args]);
      }
  );

  // Global Static OTProperties is used by the Vonage Video SDK
  window.OTProperties = {
    ...window.OTProperties,
    apiURL: VONAGE_VIDEO_HOST,
    vonageAPIURL: VONAGE_VIDEO_HOST,
  };
};

tryOverrideVonageVideoHost();
