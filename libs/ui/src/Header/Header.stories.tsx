import type { Meta, StoryObj } from '@storybook/react';
import Header from './Header';

const meta = {
  title: 'UI/Header',
  component: Header,
  parameters: {},
} satisfies Meta<typeof Header>;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Header content',
  },
  render: (args) => <Header {...args}>Header content</Header>,
};

export default meta;
