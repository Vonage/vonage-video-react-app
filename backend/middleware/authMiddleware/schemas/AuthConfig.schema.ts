import { z } from 'zod';

/**
 * The auth config contract, expressed once as a schema so both loadConfig (env parsing) and
 * authMiddleware (fail-fast at construction) validate against the same rules instead of
 * re-deriving them. `authEnabled` discriminates the union: when false nothing else is
 * required; when true every OIDC field must be present and well-formed.
 */
const AuthConfigSchema = z.discriminatedUnion('authEnabled', [
  z.object({
    authEnabled: z.literal(false),
  }),
  z.object({
    authEnabled: z.literal(true),
    oidcIssuerUrl: z.url(),
    oidcClientId: z.string().min(1),
    oidcWebRedirectUri: z.url(),
    authHeaderName: z.string().min(1).default('authorization'),
    authScheme: z.string().min(1).default('Bearer'),
    introspectPath: z.string().min(1).default('/oauth2/v1/introspect'),
    authorizePath: z.string().min(1).default('/oauth2/v1/authorize'),
    tokenPath: z.string().min(1).default('/oauth2/v1/token'),
    introspectionTimeoutMs: z.number().int().positive().default(5000),
  }),
]);

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export default AuthConfigSchema;
