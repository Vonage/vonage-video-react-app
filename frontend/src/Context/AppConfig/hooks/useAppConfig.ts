import { useAppConfigContext } from '../AppConfigContext';
import { AppConfig } from '../AppConfigContext.types';

/**
 * Hook to access the AppConfig state with a selector.
 * @param {Function} selector - Function to select a part of the AppConfig state.
 * @param {unknown[]} [dependencies] - Optional dependencies array to control re-selection.
 * @returns {Selection} The selected part of the AppConfig state.
 */
function useAppConfig<Selection>(
  selector: (state: AppConfig) => Selection,
  dependencies?: unknown[]
): Selection {
  const [selection] = useAppConfigContext(selector, dependencies);

  return selection;
}

export default useAppConfig;
