import { z } from 'zod';
import type { TRPCRuntimeConfigOptions } from '@trpc/server';
import type { Any } from '@common/types';

export const TRPCRuntimeConfigOptionsSchema: z.ZodType<TRPCRuntimeConfigOptions<Any, Any>> = z
  .object({})
  .loose();

export default TRPCRuntimeConfigOptionsSchema;
