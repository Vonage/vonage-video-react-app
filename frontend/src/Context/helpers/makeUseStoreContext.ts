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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeUseStoreContext = <TStore extends Store<any>>(context: React.Context<TStore | null>) => {
  type TState = ReturnType<TStore['getSnapshot']>;

  /**
   * Hook to access the store context.
   * @returns {TStore} The store instance, the instance wont change and wont trigger re-renders.
   * If you want to access to the store state, use the selector overload.
   */
  function useStoreContext(): TStore;

  /**
   * Hook to access a selected slice of the store state.
   * @template T
   * @param {Function} selector - Function to select a slice of the store state.
   * @param {Array} dependencies - Optional array of dependencies that trigger re-selection when changed.
   * @returns {T} The selected slice of the store state.
   */
  function useStoreContext<T>(selector: (state: TState) => T, dependencies?: unknown[]): T;

  /**
   * Hook to access a selected slice of the store state.
   * @template T
   * @param {Function} selector - Function to select a slice of the store state.
   * @param {object} options - Optional observer options.
   * @returns {T} The selected slice of the store state.
   */
  function useStoreContext<T>(selector: (state: TState) => T, options?: ObserverOptions<TState>): T;

  function useStoreContext<T>(
    selector?: (state: TState) => T,
    args?: ObserverOptions<TState> | unknown[]
  ): T | TStore {
    const store = useContext(context);

    if (!store) {
      throw new Error('[MISSING PROVIDER] useStoreContext must be used within a Store Provider.');
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

    // keep listener updated with latest parameters
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
