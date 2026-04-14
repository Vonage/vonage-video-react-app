import { describe, it, expect } from 'vitest';
import RoomNameSchema from './RoomName.schema';

describe('RoomNameSchema', () => {
  it('should accept a valid room name', () => {
    expect(RoomNameSchema.safeParse('my-room-123').success).toBe(true);
  });

  it('should reject an invalid room name', () => {
    expect(RoomNameSchema.safeParse('').success).toBe(false);
    expect(RoomNameSchema.safeParse('UPPERCASE').success).toBe(false);
  });
});
