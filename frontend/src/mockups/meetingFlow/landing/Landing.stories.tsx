import type { Meta, StoryObj } from '@storybook/react';
import mockupMeta, { type MockupArgs } from '../storybook/mockupMeta';
import LandingAgenda from './LandingAgenda';
import LandingNextUp from './LandingNextUp';
import LandingStackedCards from './LandingStackedCards';

const meta = {
  title: 'Mockups/Meeting flow/1. Landing',
  ...mockupMeta,
} satisfies Meta<MockupArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A: the current card stays as it is; a second card below lists upcoming meetings.
 */
export const AStackedCards: Story = {
  name: 'A · Stacked cards',
  render: () => <LandingStackedCards />,
};

/**
 * B: create and join move under the welcome text; the right column becomes a day-grouped agenda.
 */
export const BAgenda: Story = {
  name: 'B · Agenda column',
  render: () => <LandingAgenda />,
};

/**
 * C: one card; the soonest meeting is spotlighted with direct Join and Share, the rest are one line each.
 */
export const CNextUp: Story = {
  name: 'C · Next-up spotlight',
  render: () => <LandingNextUp />,
};
