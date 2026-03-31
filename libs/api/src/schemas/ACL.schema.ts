import { z } from 'zod';
import type { ACL } from '@vonage/jwt';
import ACLRuleSchema from './ACLRule.schema';

export const ACLSchema = z.object({
  paths: z.record(z.string(), ACLRuleSchema),
}) satisfies z.ZodType<ACL>;

export default ACLSchema;
