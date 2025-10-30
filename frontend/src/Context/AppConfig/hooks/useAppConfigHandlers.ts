import { useMemo } from 'react';
import { useAppConfigControls } from '../AppConfigContext';

/**
 * Return a non reactive access to AppConfig state and actions.
 * Useful for handlers that don't need to re-render on state changes.
 * @returns {object} The AppConfig state and actions.
 */
function useAppConfigActions() {
  const [state, actions] = useAppConfigControls();

  return useMemo(
    () => ({
      ...actions,
      state,
    }),
    [state, actions]
  );
}

export default useAppConfigActions;
