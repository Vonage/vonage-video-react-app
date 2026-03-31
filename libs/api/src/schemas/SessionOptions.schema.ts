import { z } from 'zod';
import { ArchiveModeSchema, MediaModeSchema } from '@node/schemas';

export const SessionOptionsSchema = z.object({
  archiveMode: ArchiveModeSchema.optional(),
  location: z.string().optional(),
  mediaMode: MediaModeSchema.optional(),
});

export type SessionOptions = z.infer<typeof SessionOptionsSchema>;

export function assertSessionOptions(options: unknown): asserts options is SessionOptions {
  SessionOptionsSchema.parse(options);
}

export default SessionOptionsSchema;
