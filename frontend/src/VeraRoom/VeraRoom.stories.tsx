import type { Meta, StoryObj } from '@storybook/react';

// Import the custom element to register it
import './VeraRoomElement';

const meta: Meta = {
  title: 'VeraRoom/VeraRoomElement',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <vera-room />,
};

export const WithEntryPoint: Story = {
  render: () => <vera-room entry-point="storybook" />,
};

export const WithSessionIdentifier: Story = {
  render: () => <vera-room session-identifier="demo-session-123" />,
};
