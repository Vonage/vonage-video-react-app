import type { Preview } from '@storybook/react';
import { registerIcon } from '@vonage/vivid';
import { ThemeProvider } from '../src/theme';
import '../src/styles.css';

registerIcon();

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
