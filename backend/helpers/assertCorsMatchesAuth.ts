import type { AuthConfig } from '../types/config';
import type { CorsConfig } from '../middleware/corsMiddleware/schemas/CorsConfig.schema';

/**
 * `*` combined with credentialed CORS lets any origin read authenticated responses, so it's only
 * accepted while the app is served over plain HTTP (local development, CI).
 */
function assertCorsMatchesAuth({
  authConfig,
  corsConfig,
}: {
  authConfig: AuthConfig;
  corsConfig: CorsConfig;
}): void {
  if (!authConfig.authEnabled || corsConfig.corsAllowedOrigins !== '*') return;

  const isServedOverHttps = new URL(authConfig.oidcWebRedirectUri).protocol === 'https:';

  if (!isServedOverHttps) return;

  throw new Error(
    'CORS_ALLOWED_ORIGINS must list the allowed origins, not "*", when AUTH_ENABLED is true and OIDC_WEB_REDIRECT_URI is https'
  );
}

export default assertCorsMatchesAuth;
