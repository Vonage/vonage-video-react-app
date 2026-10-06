import { z } from 'zod';

const TokenIntrospectionResponseSchema = z.discriminatedUnion('active', [
  z.object({
    active: z.literal(true),
    sub: z.string(),
    client_id: z.string().optional(),
    aud: z.union([z.string(), z.array(z.string())]).optional(),
    email: z.string().optional(),
  }),
  z.object({
    active: z.literal(false),
  }),
]);

export type TokenIntrospectionResponse = z.infer<typeof TokenIntrospectionResponseSchema>;

export type ActiveTokenIntrospectionResponse = Extract<
  TokenIntrospectionResponse,
  { active: true }
>;

export default TokenIntrospectionResponseSchema;
