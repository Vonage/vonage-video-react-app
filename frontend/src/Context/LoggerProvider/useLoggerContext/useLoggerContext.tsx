import { useEffect } from 'react';
import useSessionContext from '@hooks/useSessionContext';
import useUserContext from '@hooks/useUserContext';
import frontendLogger from '../../../logger';

/**
 * Syncs userId, sessionId, and connectionId from UserContext and SessionContext
 * into the global frontendLogger on every change.
 * When the session ends, vonageVideoClient becomes null and sessionId/connectionId
 * naturally become undefined, so no explicit clearContext is needed.
 */
const useLoggerContext = () => {
  const { vonageVideoClient } = useSessionContext();
  const { user } = useUserContext();

  const userId = user.defaultSettings.name || undefined;
  const sessionId = vonageVideoClient?.sessionId;
  const connectionId = vonageVideoClient?.connectionId;

  useEffect(() => {
    frontendLogger.setContext({ userId, sessionId, connectionId });
  }, [userId, sessionId, connectionId]);

  return { userId, sessionId, connectionId };
};

export default useLoggerContext;
