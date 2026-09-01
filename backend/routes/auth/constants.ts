export const TRANSACTION_COOKIE_NAME = 'oidc_transaction_id';
export const SESSION_COOKIE_NAME = 'oidc_session_id';

// Fixed by the Okta app registration (App 1 — VERA Web BFF) — not deployment-configurable.
export const OIDC_SCOPES = 'openid profile email offline_access';

const TEN_MINUTES_MS = 10 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

export const TRANSACTION_COOKIE_MAX_AGE_MS = TEN_MINUTES_MS;
export const DEFAULT_SESSION_COOKIE_MAX_AGE_MS = ONE_HOUR_MS;
