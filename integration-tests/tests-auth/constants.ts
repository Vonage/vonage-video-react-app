export const APP_URL = 'http://127.0.0.1:3345';
export const LOCAL_OIDC_URL = new URL(readRequiredEnv('OIDC_AUTHORIZATION_ENDPOINT')).origin;
export const LOCAL_OIDC_CLIENT_ID = readRequiredEnv('OIDC_CLIENT_ID');
export const CALLBACK_URL = readRequiredEnv('OIDC_WEB_REDIRECT_URI');
export const SESSION_COOKIE_NAME = readRequiredEnv('AUTH_SESSION_COOKIE_NAME');
export const ID_TOKEN_COOKIE_NAME = readRequiredEnv('AUTH_ID_TOKEN_COOKIE_NAME');
export const TRANSACTION_COOKIE_NAME = readRequiredEnv('AUTH_TRANSACTION_COOKIE_NAME');
export const REFRESH_WINDOW_SECONDS = Number(readRequiredEnv('AUTH_REFRESH_WINDOW_SECONDS'));
export const ACCESS_TOKEN_LIFETIME_SECONDS = Number(
  readRequiredEnv('LOCAL_OIDC_ACCESS_TOKEN_TTL_SECONDS')
);

function readRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. CI sets it in the auth-e2e job of .github/workflows/run-tests.yml; locally, export it or put it in integration-tests/auth/backend.env.`
    );
  }
  return value;
}
