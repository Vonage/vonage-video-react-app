import { isNumber, isRecord } from '@common/assertions';
import { SessionKeyClaim } from '@common/constants';
import type { ScheduleWindow } from '@common/types';

/**
 * Reads the schedule claim from a sessionKey payload decoded without verification.
 */
const readScheduleClaim = (payload: Record<string, unknown>): ScheduleWindow | null => {
  const claim = payload[SessionKeyClaim.schedule];

  if (!isRecord(claim)) return null;

  const { startsAtMs, endsAtMs } = claim;
  const isScheduleClaim = isNumber(startsAtMs) && isNumber(endsAtMs) && endsAtMs > startsAtMs;

  if (!isScheduleClaim) return null;

  return { startsAtMs, endsAtMs };
};

export default readScheduleClaim;
