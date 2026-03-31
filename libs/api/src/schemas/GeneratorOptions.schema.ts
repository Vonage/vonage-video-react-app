import { z } from 'zod';
import type { GeneratorOptions } from '@vonage/jwt';
import ACLSchema from './ACL.schema';

export const GeneratorOptionsSchema = z
  .object({
    ttl: z.number().optional(),
    issued_at: z.number().optional(),
    subject: z.string().optional(),
    jti: z.string().optional(),
    notBefore: z.number().optional(),
    acl: ACLSchema.optional(),
    key: z.string().optional(),
    exp: z.number().optional(),
  })
  .catchall(z.unknown()) satisfies z.ZodType<GeneratorOptions>;

export default GeneratorOptionsSchema;
