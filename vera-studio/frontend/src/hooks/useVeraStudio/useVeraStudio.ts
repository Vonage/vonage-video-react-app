import type { VeraUIConfig } from '@ui/theme/helpers/veraUI.types';
import { defaultDesignTokens, mergeWithDefaultDesignTokens } from '../../helpers';
import { createGlobalState, type InferAPI } from 'react-global-state-hooks';

type StudioAPI = InferAPI<typeof useVeraStudio>;

type StudioThemeMode = 'light' | 'dark';

type StudioState = {
  tokens: VeraUIConfig | null;
  selectedTheme: StudioThemeMode;
  isSaving: boolean;
  isLoading: boolean;
  loadError: string | null;
  saveError: string | null;
};

const initialState: StudioState = {
  tokens: null,
  selectedTheme: 'light',
  isSaving: false,
  isLoading: false,
  loadError: null,
  saveError: null,
};

const useVeraStudio = createGlobalState(initialState, {
  actions: {
    /**
     * Set active theme mode used by Studio preview and token editors.
     */
    setSelectedTheme: (selectedTheme: StudioThemeMode) => {
      return ({ setState }) =>
        setState((state) => ({
          ...state,
          selectedTheme,
        }));
    },

    /**
     * Partial update of the state
     */
    update: (state: Partial<StudioState>) => {
      return ({ setState }) =>
        setState((prevState) => ({
          ...prevState,
          ...state,
        }));
    },

    /**
     * Partial update of the tokens object within the state
     */
    updateTokens: (tokens: Partial<VeraUIConfig>) => {
      return ({ setState }) =>
        setState((state) => ({
          ...state,
          tokens: {
            ...state.tokens,
            ...tokens,
          },
        }));
    },

    /**
     * Load tokens from the server and update the state
     */
    loadTokens() {
      return async (api) => {
        const { actions } = api as StudioAPI;

        try {
          actions.update({ loadError: null, isLoading: true });

          const response = await fetch('/api/tokens');

          if (!response.ok) {
            const body = (await response.json()) as { error?: string };

            return actions.update({
              loadError: body.error ?? 'Unable to load tokens',
              tokens: defaultDesignTokens,
            });
          }

          const data = (await response.json()) as VeraUIConfig;

          actions.updateTokens(mergeWithDefaultDesignTokens(data));
        } catch {
          actions.update({ loadError: 'Unable to load tokens', tokens: defaultDesignTokens });
        } finally {
          actions.update({ isLoading: false });
        }
      };
    },

    /**
     * Save tokens to the server
     */
    saveTokens() {
      return async (api) => {
        const { actions, getState } = api as StudioAPI;

        try {
          const { tokens } = getState();

          if (!tokens) return;

          actions.update({ isSaving: true, saveError: null });

          const response = await fetch('/api/tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tokens),
          });

          if (!response.ok) {
            const body = (await response.json()) as { error?: string };
            actions.update({ saveError: body.error ?? 'Save failed' });
          }
        } catch {
          actions.update({ saveError: 'Save failed' });
        } finally {
          actions.update({ isSaving: false });
        }
      };
    },
  },
  callbacks: {
    onInit(api) {
      const { actions } = api as StudioAPI;

      void actions.loadTokens();
    },
  },
});

export default useVeraStudio;
