import dotenv from 'dotenv';
import path from 'node:path';
import type { AuthConfig, Config, FeedbackConfig } from '../types/config';
import AuthConfigSchema from '../middleware/authMiddleware/schemas/AuthConfig.schema';
import { fileURLToPath } from 'node:url';

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

  const introspectionTimeoutMs = process.env.AUTH_INTROSPECTION_TIMEOUT_MS;

  return AuthConfigSchema.parse({
    authEnabled: true,
    oidcIssuerUrl: process.env.OIDC_ISSUER_URL,
    oidcClientId: process.env.OIDC_CLIENT_ID,
    // Pass through undefined for unset optional fields so the schema-level defaults apply
    // (env.sh / .env / VCR manifest may override them, but they are not required).
    authHeaderName: process.env.AUTH_HEADER_NAME,
    authScheme: process.env.AUTH_SCHEME,
    introspectPath: process.env.OIDC_INTROSPECT_PATH,
    introspectionTimeoutMs: introspectionTimeoutMs ? Number(introspectionTimeoutMs) : undefined,
  });
}
