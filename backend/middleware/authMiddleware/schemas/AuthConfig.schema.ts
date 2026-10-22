import { z } from 'zod';

/**
 * The auth config contract, expressed once as a schema so both loadConfig (env parsing) and
 * authMiddleware (fail-fast at construction) validate against the same rules instead of
 * re-deriving them. `authEnabled` discriminates the union: when false nothing else is
 * required; when true every OIDC field must be present and well-formed. Project-level values
 * come from env.defaults.sh, so the schema has no defaults of its own.
 */
const AuthConfigSchema = z.discriminatedUnion('authEnabled', [
  z.object({
    authEnabled: z.literal(false),
  }),
  z.object({
    authEnabled: z.literal(true),
    oidcClientId: z.string().min(1),
    oidcWebRedirectUri: z.url(),
    oidcAuthorizationEndpoint: z.url(),
    oidcTokenEndpoint: z.url(),
    oidcIntrospectionEndpoint: z.url(),
    oidcRevocationEndpoint: z.url(),
    oidcEndSessionEndpoint: z.url(),
    oidcPostLogoutRedirectUri: z.url(),
    oidcScopes: z.string().min(1),
    authCookieSecret: z.string().refine((value) => Buffer.from(value, 'base64').length === 32, {
      message: 'must be 32 bytes encoded as base64 (generate one with `yarn generate:secret`)',
    }),
    authSessionCookieName: z.string().min(1),
    authIdTokenCookieName: z.string().min(1),
    authTransactionCookieName: z.string().min(1),
    authTransactionMaxAgeSeconds: z.coerce.number().int().positive(),
    authRefreshWindowSeconds: z.coerce.number().int().nonnegative(),
    authProviderTimeoutMs: z.coerce.number().int().positive(),
    authHeaderName: z.string().min(1),
    authScheme: z.string().min(1),
  }),
]);

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export type EnabledAuthConfig = Extract<AuthConfig, { authEnabled: true }>;

export default AuthConfigSchema;
