import { isNumber } from '@common/assertions';
import { SessionKeyClaim } from '@common/constants';

/**
 * Reads the extended minutes from a decoded sessionKey or grant payload, 0 when absent or malformed.
 */
const readExtendedClaim = (payload: Record<string, unknown>): number => {
  const claim = payload[SessionKeyClaim.extended];
  const isExtendedClaim = isNumber(claim) && claim > 0;

  if (!isExtendedClaim) return 0;

  return claim;
};

export default readExtendedClaim;
