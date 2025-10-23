/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useMemo, useRef, useSyncExternalStore } from 'react';
import type Store from './Store';
import type { StoreListener } from './Store';

export type ObserverOptions<TState extends Record<string, unknown>> = Pick<
  StoreListener<TState>,
  'equalsRoot' | 'equalsSelection'
> & {
  dependencies: unknown[];
};

/**
 * Factory function for a state management hook that enables granular context consumption.
 * @param {React.Context<TStore | null>} context - The React context containing the store instance.
 * @template TState - The type of the state object managed by the store.
 * @template TStore - The type of the store instance.
 * @returns {Function} A custom hook for consuming the store context with optional state selection and change detection.
 */
const makeUseStoreContext = <TStore extends Store<any>>(context: React.Context<TStore | null>) => {
  type TState = ReturnType<TStore['getSnapshot']>;

  // mode
  // console.log('VITE_APP_MODE', import.meta.env.VITE_APP_MODE);

  // const stack = new Error().stack ?? 'context stack not available';

  function useStoreContext(): TStore;

  function useStoreContext<T>(selector: (state: TState) => T, dependencies?: unknown[]): T;

  function useStoreContext<T>(selector: (state: TState) => T, options?: ObserverOptions<TState>): T;

  function useStoreContext<T>(
    selector?: (state: TState) => T,
    args?: ObserverOptions<TState> | unknown[]
  ): T | TStore {
    const store = useContext(context);

    if (!store) {
      throw new Error(
        [
          '[MISSING PROVIDER] useStoreContext must be used within a Store Provider.',
          'The context hook stack trace is as follows:',
          // stack,
        ].join('\n')
      );
    }

    const isArgsArray = Array.isArray(args);

    const equalsRoot = isArgsArray ? undefined : args?.equalsRoot;
    const equalsSelection = isArgsArray ? undefined : args?.equalsSelection;
    const dependencies = (isArgsArray ? args : args?.dependencies) ?? [];

    const listenerRef = useRef<Partial<StoreListener<TState>>>({
      equalsRoot,
      equalsSelection,
      onStoreChange: undefined,
      previousSelectedValue: undefined,
      selector,
    });

    // keep listener updated with latest params
    listenerRef.current.selector = selector;
    listenerRef.current.equalsRoot = equalsRoot;
    listenerRef.current.equalsSelection = equalsSelection;

    const { subscribe, getSnapshot } = useMemo(() => {
      const listener = listenerRef.current;

      if (!listener.selector) {
        const unsubscribe = () => {};
        const subscribe = () => unsubscribe;
        const getSnapshot = () => store;

        return {
          subscribe,
          getSnapshot,
        };
      }

      listener.previousSelectedValue = listener.selector(store.getSnapshot());

      listener.selector = (state: TState) => listener.selector!(state);

      listener.equalsRoot = (prev, next) => {
        return listener.equalsRoot?.(prev, next) ?? prev === next;
      };

      listener.equalsSelection = (prev, next) => {
        return listener.equalsSelection?.(prev, next) ?? prev === next;
      };

      const subscribe = (onStoreChange: () => void) => {
        listener.onStoreChange = onStoreChange;
        const unsubscribe = store.subscribe(listener as StoreListener<TState>);
        return unsubscribe;
      };

      const getSnapshot = () => {
        return listener.previousSelectedValue;
      };

      return { subscribe, getSnapshot };
      // allows dependencies to trigger re-calculation of the selected value
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store, ...dependencies]);

    return useSyncExternalStore(subscribe, getSnapshot) as T | TStore;
  }

  return useStoreContext;
};

export default makeUseStoreContext;
