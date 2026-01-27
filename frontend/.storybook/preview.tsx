import type { Preview } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import '../src/css/index.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/room/test-room']}>
        <Story />
      </MemoryRouter>
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
