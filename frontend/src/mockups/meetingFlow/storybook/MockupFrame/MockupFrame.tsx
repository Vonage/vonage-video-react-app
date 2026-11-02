import { useEffect, type PropsWithChildren, type ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '@ui/theme';
import type { MockupTheme } from '../types/MockupTheme';
import mockupI18n from '../mockupI18n';

const DARK_MODE_CLASSES = ['vera-dark-mode', 'dark'];

export type MockupFrameProps = PropsWithChildren<{
  theme: MockupTheme;
}>;

/**
 * Renders a mockup with the real Vera theme, translations and the requested color scheme.
 */
const MockupFrame = ({ theme, children }: MockupFrameProps): ReactElement => {
  useEffect(
    function applyMockupTheme() {
      const { classList } = document.documentElement;
      if (theme === 'dark') {
        classList.add(...DARK_MODE_CLASSES);
        return;
      }
      classList.remove(...DARK_MODE_CLASSES);
    },
    [theme]
  );

  return (
    <I18nextProvider i18n={mockupI18n}>
      <ThemeProvider>
        <div className="min-h-screen w-full bg-vera-background">{children}</div>
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default MockupFrame;
