import { useLayoutEffect, useMemo, type PropsWithChildren } from 'react';
import useServerSettings from './hooks/useServerSettings';
import serverSettingsStore from './serverSettingsStore';
import internalActions from './actions/internalActions';

const ServerSettingsSynchronizer = ({
  children,
  sessionKey,
}: PropsWithChildren<{ sessionKey: string | null }>) => {
  const { data, isError } = useServerSettings({ sessionKey });
  const storeApi = serverSettingsStore.use.api();
  const { applyClockOffset, markUnavailable } = useMemo(
    () => internalActions(storeApi),
    [storeApi]
  );

  useLayoutEffect(() => {
    if (data) {
      applyClockOffset(data.clockOffset);
      return;
    }

    storeApi.setState({ status: 'pending', now: null, clockOffset: null });
    if (isError) markUnavailable();
  }, [sessionKey, data, isError, storeApi, applyClockOffset, markUnavailable]);

  return children;
};

export default ServerSettingsSynchronizer;
