import z from 'zod';
import isValidSessionKey from '../assertions/isValidSessionKey';

export const SessionKeySchema = z
  .string()
  .refine((val) => isValidSessionKey(val), { message: 'Not a valid SessionKey' })
  .transform((val) => val as string);

export default SessionKeySchema;
