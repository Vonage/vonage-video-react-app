import { z } from 'zod';
import { AlgorithmTypes } from '@vonage/auth';

export const AlgorithmTypesSchema = z.enum(AlgorithmTypes) satisfies z.ZodType<AlgorithmTypes>;

export default AlgorithmTypesSchema;
