import { z } from 'zod';
import { Resolution } from '@vonage/video';

export const ResolutionSchema: z.ZodType<Resolution> = z.nativeEnum(Resolution);

export default ResolutionSchema;
