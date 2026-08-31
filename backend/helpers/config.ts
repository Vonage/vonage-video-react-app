import dotenv from 'dotenv';
import path from 'node:path';
import { z } from 'zod';
import { AuthConfig, Config, FeedbackConfig } from '../types/config';
import { fileURLToPath } from 'node:url';

const DEFAULT_AUTH_HEADER_NAME = 'authorization';
const DEFAULT_AUTH_SCHEME = 'Bearer';
const DEFAULT_INTROSPECT_PATH = '/oauth2/v1/introspect';
const DEFAULT_INTROSPECTION_TIMEOUT_MS = 5000;

/**
 * The runtimeDirectory works different on CJS and ESM
 * We are embedding __IS_CJS__ variable during build time enforce the correct behavior
 */
let runtimeDir: string = '';
if (process.env.__IS_CJS__) {
  runtimeDir = __dirname;
} else {
  runtimeDir = path.dirname(fileURLToPath(import.meta.url));
}

dotenv.config({ path: path.join(runtimeDir, '.env'), override: true });

const loadConfig = (): Config => {
  const provider = process.env.VIDEO_SERVICE_PROVIDER ?? '';
  const sessionKeySecret = process.env.SESSION_KEY_SECRET ?? '';

  const loggerVerbose = process.env.LOGGER_VERBOSE === 'true';

  const authConfig = loadAuthConfig();

  const feedbackConfig: FeedbackConfig = {
    url: process.env.JIRA_URL,
    apiUrl: process.env.JIRA_API_URL,
    token: process.env.JIRA_TOKEN,
    key: process.env.JIRA_PROJECT_KEY,
    componentId: process.env.JIRA_COMPONENT_ID,
    iOSComponentId: process.env.JIRA_iOS_COMPONENT_ID,
    androidComponentId: process.env.JIRA_ANDROID_COMPONENT_ID,
    epicLink: process.env.JIRA_EPIC_LINK,
    epicUrl: process.env.JIRA_EPIC_URL,
    severityId: process.env.JIRA_SEVERITY_ID,
    gollumUrl: process.env.GOLLUM_BASE_URL,
  };

  if (provider === 'vonage') {
    const applicationId = process.env.VONAGE_APP_ID ?? '';
    const privateKey = process.env.VONAGE_PRIVATE_KEY ?? '';
    const videoHost = process.env.VONAGE_VIDEO_HOST;

    if (!applicationId || !privateKey) {
      throw new Error('Missing config values for Vonage');
    }

    return {
      ...feedbackConfig,
      ...authConfig,
      applicationId,
      privateKey,
      provider: 'vonage',
      videoHost,
      sessionKeySecret,
      loggerVerbose,
    };
  }

  if (provider === 'opentok') {
    const apiKey = process.env.OT_API_KEY ?? '';
    const apiSecret = process.env.OT_API_SECRET ?? '';

    if (!apiKey || !apiSecret) {
      throw new Error('Missing config values for OpenTok');
    }

    return {
      ...feedbackConfig,
      ...authConfig,
      apiKey,
      apiSecret,
      provider: 'opentok',
      sessionKeySecret,
      loggerVerbose,
    };
  }

  throw new Error(`Unknown video service provider: ${provider || 'undefined'}`);
};

export default loadConfig;

/**
 * Reads only the auth-related env vars, validated here since this is the single
 * schema-validated source of truth for config in the app (consumers must go through
 * loadConfig, not re-derive this independently).
 */
function loadAuthConfig(): AuthConfig {
  if (process.env.AUTH_ENABLED !== 'true') return { authEnabled: false };

  const oidcIssuerUrl = process.env.OIDC_ISSUER_URL ?? '';
  const oidcClientId = process.env.OIDC_CLIENT_ID ?? '';
  const isValidIssuerUrl = z.url().safeParse(oidcIssuerUrl).success;

  if (!oidcIssuerUrl || !oidcClientId || !isValidIssuerUrl) {
    throw new Error(
      'AUTH_ENABLED is true but OIDC_ISSUER_URL (must be a valid URL) / OIDC_CLIENT_ID is not set'
    );
  }

  return {
    authEnabled: true,
    oidcIssuerUrl,
    oidcClientId,
    authHeaderName: process.env.AUTH_HEADER_NAME ?? DEFAULT_AUTH_HEADER_NAME,
    authScheme: process.env.AUTH_SCHEME ?? DEFAULT_AUTH_SCHEME,
    introspectPath: process.env.OIDC_INTROSPECT_PATH ?? DEFAULT_INTROSPECT_PATH,
    introspectionTimeoutMs: Number(
      process.env.AUTH_INTROSPECTION_TIMEOUT_MS ?? DEFAULT_INTROSPECTION_TIMEOUT_MS
    ),
  };
}
