import { VideoAction } from '@api-lib/types';
import z from 'zod';

/**
 * All known Vera actions
 */
export const VideoActionSchema = z.enum(VideoAction);

export function assertVideoAction(action: unknown): asserts action is VideoAction {
  VideoActionSchema.parse(action);
}

export default VideoActionSchema;
