import { createContext, type InferAPI } from 'react-global-state-hooks';
import internalActions from './actions/internalActions';
import useServerSettings from './hooks/useServerSettings';
import type { ServerSettingsState } from './types';

export type ServerSettingsAPI = InferAPI<typeof serverSettings$>;

const tickIntervalMilliseconds = 1000;

/**
 * Holds the server settings and the ticking server time.
 */
const serverSettings$ = createContext(
  (): ServerSettingsState => ({ status: 'pending', now: null, clockOffset: null }),
  {
    name: 'serverSettings',
    callbacks: {
      onMounted: (storeTools) => {
        const { tick } = internalActions(storeTools);
        const intervalId = setInterval(tick, tickIntervalMilliseconds);

        return () => clearInterval(intervalId);
      },
    },
  }
);

const extensions = {
  /**
   * Hook to fetch the server settings for a sessionKey and update the store's server time with the answer.
   */
  useServerSettings,
  /**
   * Hook to get whether the server time is still pending, unavailable or known.
   */
  useServerTimeStatus: serverSettings$.use.createSelectorHook((state) => state.status),
};

export default Object.assign(serverSettings$, extensions);
