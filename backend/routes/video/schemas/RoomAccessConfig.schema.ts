import { z } from 'zod';

const RoomAccessConfigSchema = z.object({
  legacyRoomNameLinksEnabled: z.boolean(),
});

export type RoomAccessConfig = z.infer<typeof RoomAccessConfigSchema>;

export default RoomAccessConfigSchema;
