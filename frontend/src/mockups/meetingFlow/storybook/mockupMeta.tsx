import type { Decorator, Meta } from '@storybook/react';
import MockupFrame from './MockupFrame';
import type { MockupTheme } from './types/MockupTheme';

export type MockupArgs = {
  theme: MockupTheme;
};

const mockupDecorator: Decorator<MockupArgs> = (Story, { args }) => (
  <MockupFrame theme={args.theme}>
    <Story />
  </MockupFrame>
);

/**
 * Shared Storybook settings for every meeting flow mockup: full-screen layout and a light/dark switch.
 */
const mockupMeta = {
  decorators: [mockupDecorator],
  parameters: { layout: 'fullscreen' },
  args: { theme: 'light' },
  argTypes: {
    theme: { control: { type: 'inline-radio' }, options: ['light', 'dark'] },
  },
} satisfies Omit<Meta<MockupArgs>, 'title'>;

export default mockupMeta;
