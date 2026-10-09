import { z } from 'zod';

const TokenExchangeResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  id_token: z.string().optional(),
  // Not in RFC 6749; reported by some providers (e.g. Keycloak, Microsoft Entra).
  refresh_expires_in: z.number().optional(),
  refresh_token_expires_in: z.number().optional(),
});

export type TokenExchangeResponse = z.infer<typeof TokenExchangeResponseSchema>;

export default TokenExchangeResponseSchema;
