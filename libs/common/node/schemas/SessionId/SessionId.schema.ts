import z from 'zod';
import { isValidSessionId } from '../../../src/assertions';

export const SessionIdSchema = z
  .string()
  .refine((val) => isValidSessionId(val), { message: 'Not a valid SessionId' })
  .transform((val) => val as string);

export default SessionIdSchema;
