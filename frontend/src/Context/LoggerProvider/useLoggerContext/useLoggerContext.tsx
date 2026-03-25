import { useEffect } from 'react';
import useSessionContext from '@hooks/useSessionContext';
import useUserContext from '@hooks/useUserContext';
import frontendLogger from '../../../logger';

/**
 * Derives logger context (userId, sessionId, connectionId) from UserContext and SessionContext
 * and keeps the frontendLogger in sync via setContext/clearContext.
 */
const useLoggerContext = () => {
  const { vonageVideoClient } = useSessionContext();
  const { user } = useUserContext();

  const userId = user.defaultSettings.name || undefined;
  const sessionId = vonageVideoClient?.sessionId;
  const connectionId = vonageVideoClient?.connectionId;

  useEffect(() => {
    frontendLogger.setContext({ userId, sessionId, connectionId });

    return () => {
      frontendLogger.clearContext();
    };
  }, [userId, sessionId, connectionId]);

  return { userId, sessionId, connectionId };
};

export default useLoggerContext;
