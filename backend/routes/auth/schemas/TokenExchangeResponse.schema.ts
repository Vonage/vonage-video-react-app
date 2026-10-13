import { z } from 'zod';

const TokenExchangeResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
});

export type TokenExchangeResponse = z.infer<typeof TokenExchangeResponseSchema>;

export default TokenExchangeResponseSchema;
