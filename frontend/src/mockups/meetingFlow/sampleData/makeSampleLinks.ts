import type { MeetingRole } from '../types/MeetingRole';
import type { RoleLink } from '../types/RoleLink';

const SAMPLE_ORIGIN = 'https://vera.example.com/waiting-room/';

/**
 * Builds fake role links shaped like real sessionKey URLs.
 */
function makeSampleLinks({ seed, roles }: { seed: string; roles: MeetingRole[] }): RoleLink[] {
  return roles.map((role, index) => ({
    role,
    url: `${SAMPLE_ORIGIN}eyJhbGciOiJIUzI1NiJ9.${seed}${index}.${seed.slice(0, 6)}x${index}`,
  }));
}

export default makeSampleLinks;
