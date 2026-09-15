import z from 'zod';
import { isValidSessionKey } from '../../../src/assertions';

export const SessionKeySchema = z
  .string()
  .refine((val) => isValidSessionKey(val), { message: 'Not a valid SessionKey' })
  .transform((val) => val);

export default SessionKeySchema;
