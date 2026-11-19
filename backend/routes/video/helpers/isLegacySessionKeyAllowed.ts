import { isNil } from '@common/assertions';
import loadConfig from '../../../helpers/config';
import type { RequestWithTokenAuth } from '../../../middleware/authMiddleware/authMiddleware';

function isLegacySessionKeyAllowed({ user }: { user: RequestWithTokenAuth['user'] }): boolean {
  const { legacySessionKeysEnabled, authEnabled } = loadConfig();

  return legacySessionKeysEnabled && (!authEnabled || !isNil(user));
}

export default isLegacySessionKeyAllowed;
