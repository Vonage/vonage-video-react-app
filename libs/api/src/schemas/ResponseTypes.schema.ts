import { z } from 'zod';
import { ResponseTypes } from '@vonage/vetch';

export const ResponseTypesSchema = z.enum(ResponseTypes) satisfies z.ZodType<ResponseTypes>;

export default ResponseTypesSchema;
