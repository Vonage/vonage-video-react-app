import { isNumber, isRecord } from '@common/assertions';
import { SessionKeyClaim } from '@common/constants';
import type { ScheduleClaim } from '@common/types';

/**
 * Reads the schedule claim from a sessionKey payload decoded without verification.
 */
const readScheduleClaim = (payload: Record<string, unknown>): ScheduleClaim | null => {
  const claim = payload[SessionKeyClaim.schedule];

  if (!isRecord(claim)) return null;

  const { startsAtMs, durationMins } = claim;
  const isScheduleClaim = isNumber(startsAtMs) && isNumber(durationMins) && durationMins > 0;

  if (!isScheduleClaim) return null;

  return { startsAtMs, durationMins };
};

export default readScheduleClaim;
