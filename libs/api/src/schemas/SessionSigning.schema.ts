import z from 'zod';
import type { Algorithm } from 'jsonwebtoken';

export const SessionSigningSchema = z.object({
  secret: z.string().nonempty(),
  algorithm: z
    .enum([
      'HS256',
      'HS384',
      'HS512',
      'RS256',
      'RS384',
      'RS512',
      'ES256',
      'ES384',
      'ES512',
      'PS256',
      'PS384',
      'PS512',
      'none',
    ])
    .optional(),
}) satisfies z.ZodType<SessionSigning>;

export type SessionSigning = {
  secret: string;
  algorithm?: Algorithm;
};

export default SessionSigningSchema;
