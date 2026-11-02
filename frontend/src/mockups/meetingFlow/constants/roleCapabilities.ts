import type { MeetingRole } from '../types/MeetingRole';

export type RoleCapability = 'send' | 'receive' | 'moderate';

const roleCapabilities: Record<MeetingRole, Record<RoleCapability, boolean>> = {
  moderator: { send: true, receive: true, moderate: true },
  publisher: { send: true, receive: true, moderate: false },
  subscriber: { send: false, receive: true, moderate: false },
  publisherOnly: { send: true, receive: false, moderate: false },
};

export default roleCapabilities;
