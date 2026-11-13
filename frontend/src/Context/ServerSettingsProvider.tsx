import type { PropsWithChildren } from 'react';
import { serverSettings$ } from '@core/stores';
import useSessionKeyParam from '@hooks/useSessionKeyParam';

const ServerSettingsProvider = ({ children }: PropsWithChildren) => {
  const { sessionKey, sessionKeyStatus } = useSessionKeyParam();

  return (
    <serverSettings$.Provider sessionKey={sessionKeyStatus === 'valid' ? sessionKey : null}>
      {children}
    </serverSettings$.Provider>
  );
};

export default ServerSettingsProvider;
