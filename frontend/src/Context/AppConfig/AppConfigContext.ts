import createContext, { type InferContextType } from 'react-global-state-hooks/createContext';
import updateAppConfig from './actions/updateAppConfig';
import loadAppConfig from './actions/loadAppConfig';
import initialValue from './helpers/defaultAppConfig';

const [useHook, provider, context] = createContext(initialValue, {
  actions: {
    updateAppConfig,
    loadAppConfig,
  },
});

const [useControls] = useHook.stateControls();

/**
 * The AppConfig context instance.
 */
export const AppConfigContext = context;

/**
 * Provider component that makes the config available across the app.
 * @param props - The component props.
 * @param props.value - (optional) Initial value override for the AppConfig state.
 * @param props.onCreated - (optional) Callback invoked when the provider is created, receives the context as argument.
 * @returns The AppConfig provider component.
 */
export const AppConfigProvider = provider;

/**
 * Hook to access the AppConfig state with a selector.
 * @param {Function} selector - (optional) Function to select a part of the AppConfig state.
 * @param {unknown[]} [dependencies] - Optional dependencies array to control re-selection.
 * @returns {[Selection, AppConfigActions]} If selector is provided, returns [selected state, actions], otherwise returns [entire state, actions].
 */
export const useAppConfigContext = useHook;

/**
 * Hook to access non-reactive AppConfig state and actions.
 * Useful for handlers that don't need to re-render on state changes.
 * @returns [getter, actions] The AppConfig state getter and actions.
 */
export const useAppConfigControls = useControls;

/**
 * The AppConfig context type.
 * Represents the shape of the context including state and actions.
 */
export type AppConfigContextType = InferContextType<typeof provider>;

/**
 * The AppConfig actions type.
 * Represents the available actions to modify or interact with the state.
 */
export type AppConfigActions = AppConfigContextType['actions'];
