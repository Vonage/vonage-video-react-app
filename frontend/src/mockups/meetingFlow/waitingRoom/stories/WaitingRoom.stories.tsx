import type { Meta, StoryObj } from '@storybook/react';
import mockupMeta, { type MockupArgs } from '../../storybook/mockupMeta';
import WaitingCardButtonState from '../variants/WaitingCardButtonState';
import WaitingCardCountdownPanel from '../variants/WaitingCardCountdownPanel';
import WaitingCardStatusLine from '../variants/WaitingCardStatusLine';
import ScheduleStatesBoard from './ScheduleStatesBoard';
import WaitingRoomPageFrame from './WaitingRoomPageFrame';

const meta = {
  title: 'Mockups/Meeting flow/7. Waiting room',
  ...mockupMeta,
} satisfies Meta<MockupArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A, every state: a single status line under the meeting name; Join keeps its label.
 */
export const AStatusLineStates: Story = {
  name: 'A · Status line, all states',
  render: () => <ScheduleStatesBoard card={WaitingCardStatusLine} />,
};

/**
 * A on the page, under five minutes.
 */
export const AStatusLinePage: Story = {
  name: 'A · Status line, page',
  render: () => <WaitingRoomPageFrame card={WaitingCardStatusLine} stateKey="withinFiveMinutes" />,
};

/**
 * B, every state: a countdown panel carries the wait under the meeting name.
 */
export const BCountdownPanelStates: Story = {
  name: 'B · Countdown panel, all states',
  render: () => <ScheduleStatesBoard card={WaitingCardCountdownPanel} />,
};

/**
 * B on the page, under five minutes.
 */
export const BCountdownPanelPage: Story = {
  name: 'B · Countdown panel, page',
  render: () => (
    <WaitingRoomPageFrame card={WaitingCardCountdownPanel} stateKey="withinFiveMinutes" />
  ),
};

/**
 * C, every state: a status chip on top, the countdown lives in the Join button label.
 */
export const CButtonStateStates: Story = {
  name: 'C · Button label, all states',
  render: () => <ScheduleStatesBoard card={WaitingCardButtonState} />,
};

/**
 * C on the page, under five minutes.
 */
export const CButtonStatePage: Story = {
  name: 'C · Button label, page',
  render: () => <WaitingRoomPageFrame card={WaitingCardButtonState} stateKey="withinFiveMinutes" />,
};

/**
 * The started state on the page for the recommended variant B, with Join available.
 */
export const BCountdownPanelStartedPage: Story = {
  name: 'B · Countdown panel, started page',
  render: () => <WaitingRoomPageFrame card={WaitingCardCountdownPanel} stateKey="started" />,
};
