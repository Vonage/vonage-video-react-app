import type { MeetingRole } from './MeetingRole';

export type InviteeRole = Exclude<MeetingRole, 'moderator'>;

export default InviteeRole;
