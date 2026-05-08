import { createContext, type InferAPI } from 'react-global-state-hooks';
import { RuntimeState } from './types';

export type RuntimeAPI = InferAPI<typeof runtimeStore>;

const runtimeStore = createContext(null! as RuntimeState, {
  name: 'runtime',
  actions: {
    setLanguage(language: string) {
      return ({ setState }) => {
        setState((state) => ({ ...state, language }));
      };
    },
  },
});

export default runtimeStore;
