import { actions } from 'react-global-state-hooks';
import type { ServerSettingsAPI } from '../types';

const internalActions = actions<ServerSettingsAPI>()({
  tick() {
    return function tickServerClock({ getState, setState }) {
      const state = getState();
      if (state.status === 'pending') return;

      setState({ ...state, now: Date.now() + (state.clockOffset ?? 0) });
    };
  },
});

export default internalActions;
