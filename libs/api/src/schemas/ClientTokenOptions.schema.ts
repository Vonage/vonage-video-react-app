import { z } from 'zod';
import type { ClientTokenOptions } from '@vonage/video';

export const ClientTokenOptionsSchema = z.object({
  role: z.string().optional(),
  data: z.string().optional(),
  expireTime: z.number().optional(),
  initialLayoutClassList: z.array(z.string()).optional(),
}) satisfies z.ZodType<ClientTokenOptions>;

export default ClientTokenOptionsSchema;
