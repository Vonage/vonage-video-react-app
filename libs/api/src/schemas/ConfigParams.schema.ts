import { z } from 'zod';
import type { ConfigParams } from '@vonage/server-client';
import ResponseTypesSchema from './ResponseTypes.schema';

export const ConfigParamsSchema = z.object({
  restHost: z.string().optional(),
  apiHost: z.string().optional(),
  videoHost: z.string().optional(),
  responseType: ResponseTypesSchema.optional(),
  timeout: z.number().optional(),
  meetingsHost: z.string().optional(),
  appendUserAgent: z.string().optional(),
}) satisfies z.ZodType<ConfigParams>;

export default ConfigParamsSchema;
