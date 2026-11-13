import { useLayoutEffect, type PropsWithChildren } from 'react';
import { createContext, shallowCompare, type InferAPI } from 'react-global-state-hooks';
import internalActions from './actions/internalActions';
import useServerSettings from './hooks/useServerSettings';
import useServerSettingsInitializer from './hooks/useServerSettingsInitializer';
import type { ServerSettingsState } from './types';
import getScheduleStatus from './selectors/getScheduleStatus';
import getSecondsUntilEnd from './actions/getSecondsUntilEnd';

export type ServerSettingsAPI = InferAPI<typeof serverSettings$>;

const tickIntervalMilliseconds = 1000;

/**
 * Holds the server settings and the ticking server time.
 */
const serverSettings$ = createContext(
  (): ServerSettingsState => ({
    status: 'pending',
    now: null,
    clockOffset: null,
    scheduleWindow: null,
  }),
  {
    name: 'serverSettings',
    actions: { getSecondsUntilEnd },
    callbacks: {
      onMounted: function startServerClock(storeTools) {
        const { tick } = internalActions(storeTools);
        const intervalId = setInterval(tick, tickIntervalMilliseconds);

        return function stopServerClock() {
          clearInterval(intervalId);
        };
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
      initializeSettings,
    }: PropsWithChildren<{ initializeSettings: () => ServerSettingsState }>) => {
      const serverSettings = serverSettings$.use.api();

      useLayoutEffect(
        function synchronizeServerSettings() {
          serverSettings.setState(initializeSettings());
        },
        [serverSettings, initializeSettings]
      );

      return children;
    };
    const Provider = ({ children, sessionKey, ...props }: ProviderProps) => {
      const initializeSettings = useServerSettingsInitializer(sessionKey);

      return (
        <StoreProvider value={initializeSettings} {...props}>
          <Synchronizer initializeSettings={initializeSettings}>{children}</Synchronizer>
        </StoreProvider>
      );
    };
    const makeProviderWrapper = ({
      sessionKey,
      ...options
    }: NonNullable<Parameters<typeof StoreProvider.makeProviderWrapper>[0]> & {
      sessionKey: string | null;
    }) => {
      const { wrapper: Wrapper, ...rest } = StoreProvider.makeProviderWrapper(options);
      return {
        ...rest,
        wrapper: function ServerSettingsTestProvider({
          children,
          ...props
        }: Parameters<typeof Wrapper>[0]) {
          const initializeSettings = useServerSettingsInitializer(sessionKey);

          return (
            <Wrapper value={options.value ?? initializeSettings} {...props}>
              <Synchronizer initializeSettings={initializeSettings}>{children}</Synchronizer>
            </Wrapper>
          );
        },
      };
    };
    return Object.assign(Provider, { ...StoreProvider, makeProviderWrapper });
  })(),
  /**
   * Hook to fetch the server settings for a sessionKey.
   */
  useServerSettings,
  /**
   * Hook to get whether the server time is still pending, unavailable or known.
   */
  useServerTimeStatus: serverSettings$.use.createSelectorHook((state) => state.status),
  useScheduleWindow: serverSettings$.use.createSelectorHook((state) => state.scheduleWindow),
  useScheduleStatus: serverSettings$.use.createSelectorHook(getScheduleStatus, {
    isEqual: shallowCompare,
  }),
  useSecondsUntilEnd() {
    const { getSecondsUntilEnd } = serverSettings$.use.actions();
    return serverSettings$.use.select(getSecondsUntilEnd);
  },
};

export default { ...serverSettings$, ...extensions };
