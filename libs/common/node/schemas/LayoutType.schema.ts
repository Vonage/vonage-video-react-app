import { z } from 'zod';
import { LayoutType } from '@vonage/video';

export const LayoutTypeSchema: z.ZodType<LayoutType> = z.enum(LayoutType);

export default LayoutTypeSchema;
