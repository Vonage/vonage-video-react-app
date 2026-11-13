import { type PropsWithChildren } from 'react';
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
  Provider: (() => {
    const StoreProvider = serverSettings$.Provider;
    type ProviderProps = Parameters<typeof StoreProvider>[0] & { sessionKey: string | null };
    const Synchronizer = ({
      children,
      sessionKey,
    }: PropsWithChildren<{ sessionKey: string | null }>) => {
      useServerSettings({
        sessionKey,
        queryOptions: {
          retry: false,
          refetchInterval: (query) => (query.state.status === 'error' ? 10_000 : false),
        },
      });
      return children;
    };
    const Provider = ({ children, sessionKey, ...props }: ProviderProps) => (
      <StoreProvider {...props}>
        <Synchronizer sessionKey={sessionKey}>{children}</Synchronizer>
      </StoreProvider>
    );
    const makeProviderWrapper = ({
      sessionKey,
      ...options
    }: NonNullable<Parameters<typeof StoreProvider.makeProviderWrapper>[0]> & {
      sessionKey: string | null;
    }) => {
      const { wrapper: Wrapper, ...rest } = StoreProvider.makeProviderWrapper(options);
      return {
        ...rest,
        wrapper: ({ children, ...props }: Parameters<typeof Wrapper>[0]) => (
          <Wrapper {...props}>
            <Synchronizer sessionKey={sessionKey}>{children}</Synchronizer>
          </Wrapper>
        ),
      };
    };
    return Object.assign(Provider, { ...StoreProvider, makeProviderWrapper });
  })(),
  /**
   * Hook to fetch the server settings for a sessionKey and update the store's server time with the answer.
   */
  useServerSettings,
  /**
   * Hook to get whether the server time is still pending, unavailable or known.
   */
  useServerTimeStatus: serverSettings$.use.createSelectorHook((state) => state.status),
};

export default { ...serverSettings$, ...extensions };
