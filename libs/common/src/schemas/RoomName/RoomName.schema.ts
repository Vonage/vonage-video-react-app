import z from 'zod';
import { isValidRoomName } from '../../assertions';

export const RoomNameSchema = z
  .string()
  .refine((val) => isValidRoomName(val), { message: 'Not a valid room name' });

export default RoomNameSchema;
