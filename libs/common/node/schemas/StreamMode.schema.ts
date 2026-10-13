import { z } from 'zod';
import { StreamMode } from '@vonage/video';

export const StreamModeSchema: z.ZodType<StreamMode> = z.nativeEnum(StreamMode);

export default StreamModeSchema;
