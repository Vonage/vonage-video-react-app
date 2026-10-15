import { useEffect } from 'react';
import useSessionContext from '@hooks/useSessionContext';
import useUserContext from '@hooks/useUserContext';
import frontendLogger from '../../logger';

const LoggerSynchronizer = () => {
  const { vonageVideoClient } = useSessionContext();
  const { user } = useUserContext();

  const userId = user.defaultSettings.name || undefined;
  const sessionId = vonageVideoClient?.sessionId;
  const connectionId = vonageVideoClient?.connectionId;

  useEffect(() => {
    frontendLogger.setContext({ userId, sessionId, connectionId });
  }, [userId, sessionId, connectionId]);

  return null;
};

export default LoggerSynchronizer;
