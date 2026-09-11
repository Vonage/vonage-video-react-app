import { z } from 'zod';
import { MediaMode } from '@vonage/video';

export const MediaModeSchema: z.ZodType<MediaMode> = z.nativeEnum(MediaMode);

export default MediaModeSchema;
