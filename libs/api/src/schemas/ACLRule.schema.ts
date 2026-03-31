import { z } from 'zod';
import type { ACLRule } from '@vonage/jwt';

export const ACLRuleSchema = z.object({
  methods: z.array(z.enum(['POST', 'PUT', 'PATCH', 'GET', 'DELETE'])).optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
}) satisfies z.ZodType<ACLRule>;

export default ACLRuleSchema;
