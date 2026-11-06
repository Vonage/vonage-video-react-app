import { isNumber, isRecord } from '@common/assertions';
import { SessionKeyClaim } from '@common/constants';
import type { ScheduleClaim } from '@common/types';

/**
 * Reads the schedule claim from a sessionKey payload decoded without verification.
 */
const readScheduleClaim = (payload: Record<string, unknown>): ScheduleClaim | null => {
  const claim = payload[SessionKeyClaim.schedule];

  if (!isRecord(claim)) return null;

  const { at, min } = claim;
  const isScheduleClaim = isNumber(at) && isNumber(min) && min > 0;

  if (!isScheduleClaim) return null;

  return { at, min };
};

export default readScheduleClaim;
