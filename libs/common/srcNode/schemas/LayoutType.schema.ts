import { z } from 'zod';
import { LayoutType } from '@vonage/video';

export const LayoutTypeSchema: z.ZodType<LayoutType> = z.nativeEnum(LayoutType);

export default LayoutTypeSchema;
