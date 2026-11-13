import { createContext, type InferAPI } from 'react-global-state-hooks';
import internalActions from './actions/internalActions';
import type { ServerSettingsState } from './types';

export type ServerSettingsAPI = InferAPI<typeof serverSettingsStore>;

const tickIntervalMilliseconds = 1000;

/**
 * Holds the server settings and the ticking server time.
 */
const serverSettingsStore = createContext(
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

export default serverSettingsStore;
