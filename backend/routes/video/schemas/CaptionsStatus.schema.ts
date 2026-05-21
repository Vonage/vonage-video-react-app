import { z } from 'zod';

export type CaptionsStatus = z.infer<typeof CaptionsStatusSchema>;

const CaptionsStatusSchema = z.enum(['started', 'transcribing', 'stopped', 'failed']);

export default CaptionsStatusSchema;
