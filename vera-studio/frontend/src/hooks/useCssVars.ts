import useVeraStudio from './useVeraStudio';
import { tokensToCssVars } from '../helpers';

const useCssVars = useVeraStudio.createSelectorHook(
  ({ tokens, selectedTheme }) => tokensToCssVars({ tokens, selectedTheme }),
  {
    isEqualRoot: (prev, next) => {
      const didTokensChange = prev.tokens !== next.tokens;
      const didThemeChange = prev.selectedTheme !== next.selectedTheme;

      return !didTokensChange && !didThemeChange;
    },
  }
);

export default useCssVars;
