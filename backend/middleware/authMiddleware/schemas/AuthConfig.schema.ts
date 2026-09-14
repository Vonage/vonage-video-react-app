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
    authHeaderName: z.string().min(1),
    authScheme: z.string().min(1),
    introspectPath: z.string().min(1),
    introspectionTimeoutMs: z.number().int().positive(),
  }),
]);

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export default AuthConfigSchema;
