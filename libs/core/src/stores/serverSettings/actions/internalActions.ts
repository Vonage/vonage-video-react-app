import { actions } from 'react-global-state-hooks';
import type { ServerSettingsAPI } from '../types';

const internalActions = actions<ServerSettingsAPI>()({
  tick() {
    return ({ getState, setState }) => {
      const state = getState();
      if (state.status === 'pending') return;

      setState({ ...state, now: Date.now() + (state.clockOffset ?? 0) });
    };
  },

  applyClockOffset(clockOffset: number) {
    return ({ setState }) => {
      setState({ status: 'known', clockOffset, now: Date.now() + clockOffset });
    };
  },

  markUnavailable() {
    return ({ getState, setState }) => {
      const isServerTimeKnown = getState().status === 'known';
      if (isServerTimeKnown) return;

      setState({ status: 'unavailable', clockOffset: null, now: Date.now() });
    };
  },
});

export default internalActions;
