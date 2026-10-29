import z from 'zod';
import { ClientLogSessionSchema } from './ClientLogSession.schema';

/**
 * Frontend → Backend logging payload contract.
 * Do not add required fields or change field types without coordinating FE and BE.
 */
export const ClientLogEventSchema = z.object({
  action: z.string().min(1),
  variation: z.string().optional(),
  session: ClientLogSessionSchema.optional(),
  sessionId: z.string().optional(),
  connectionId: z.string().optional(),
  clientSystemTime: z.number(),
  payload: z.record(z.string(), z.unknown()).optional(),
  source: z.string(),
  guid: z.string().min(1),
  level: z.enum(['info', 'error']),
  userAgent: z.string(),
  clientVersion: z.string().optional(),
  sdkId: z.string().optional(),
  componentId: z.string().optional(),
  partnerId: z.string().optional(),
  logVersion: z.string().optional(),
  name: z.string().optional(),
  /** Kibana indexes the user identifier under this field; a root `userId` is not queryable. */
  referrer: z.string().optional(),
});

export type ClientLogEvent = z.infer<typeof ClientLogEventSchema>;

/** Error shape in serialized payload (avoids sending Error instances over the wire). */
export type SerializedError = {
  message: string;
  name: string;
  stack?: string;
};
