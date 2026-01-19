import { z } from 'zod';
import type { SignedHashParams } from '@vonage/auth';
import AlgorithmTypesSchema from './AlgorithmTypes.schema';

export const SignedHashParamsSchema = z.object({
  secret: z.string(),
  algorithm: AlgorithmTypesSchema,
}) satisfies z.ZodType<SignedHashParams>;

export default SignedHashParamsSchema;
