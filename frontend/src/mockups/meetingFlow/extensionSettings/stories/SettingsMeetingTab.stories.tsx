import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement, ReactNode } from 'react';
import mockupMeta, { type MockupArgs } from '../../storybook/mockupMeta';
import MeetingRoomWithMeetingTimer from '../components/MeetingRoomWithMeetingTimer';
import SettingsDialogMockup from '../components/SettingsDialogMockup';
import MeetingTabRadioCards from '../variants/MeetingTabRadioCards/MeetingTabRadioCards';
import MeetingTabRows from '../variants/MeetingTabRows/MeetingTabRows';
import MeetingTabTimeline from '../variants/MeetingTabTimeline/MeetingTabTimeline';
import type { SampleMeetingTabStateKey } from './sampleMeetingTabStates';
import WithMeetingTabState from './WithMeetingTabState';

const meta = {
  title: 'Mockups/Meeting flow/8. Settings meeting tab',
  ...mockupMeta,
} satisfies Meta<MockupArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

const SettingsOverMeetingRoom = ({
  stateKey,
  children,
}: {
  stateKey: SampleMeetingTabStateKey;
  children: ReactNode;
}): ReactElement => (
  <WithMeetingTabState stateKey={stateKey}>
    <MeetingRoomWithMeetingTimer />
    <SettingsDialogMockup>{children}</SettingsDialogMockup>
  </WithMeetingTabState>
);

/**
 * A: signed in at 3:56 PM, 4 minutes before the end; +20 is chosen and the button names the new end time.
 */
export const ARowsCanExtend: Story = {
  name: 'A · Rows, can extend',
  render: () => (
    <SettingsOverMeetingRoom stateKey="canExtend">
      <MeetingTabRows />
    </SettingsOverMeetingRoom>
  ),
};

/**
 * A after 2 h of extensions: the chips and the button are disabled and a notice says why.
 */
export const ARowsAtCap: Story = {
  name: 'A · Rows, at the cap',
  render: () => (
    <SettingsOverMeetingRoom stateKey="atCap">
      <MeetingTabRows />
    </SettingsOverMeetingRoom>
  ),
};

/**
 * A for a guest: the rows stay, the extend controls are replaced by "Sign in to extend this meeting."
 */
export const ARowsGuest: Story = {
  name: 'A · Rows, guest',
  render: () => (
    <SettingsOverMeetingRoom stateKey="guest">
      <MeetingTabRows />
    </SettingsOverMeetingRoom>
  ),
};

/**
 * A right after extending by 20 minutes: a confirmation on top, the rows show the new end and allowance.
 */
export const ARowsAfterExtending: Story = {
  name: 'A · Rows, after extending',
  render: () => (
    <SettingsOverMeetingRoom stateKey="afterExtending">
      <MeetingTabRows />
    </SettingsOverMeetingRoom>
  ),
};

/**
 * B: the timeline previews the chosen +20 as a dashed segment before the cap.
 */
export const BTimelineCanExtend: Story = {
  name: 'B · Timeline, can extend',
  render: () => (
    <SettingsOverMeetingRoom stateKey="canExtend">
      <MeetingTabTimeline />
    </SettingsOverMeetingRoom>
  ),
};

/**
 * B at the cap: the bar is full up to the lock.
 */
export const BTimelineAtCap: Story = {
  name: 'B · Timeline, at the cap',
  render: () => (
    <SettingsOverMeetingRoom stateKey="atCap">
      <MeetingTabTimeline />
    </SettingsOverMeetingRoom>
  ),
};

/**
 * B for a guest: the timeline is shown without the controls.
 */
export const BTimelineGuest: Story = {
  name: 'B · Timeline, guest',
  render: () => (
    <SettingsOverMeetingRoom stateKey="guest">
      <MeetingTabTimeline />
    </SettingsOverMeetingRoom>
  ),
};

/**
 * B right after extending by 20 minutes.
 */
export const BTimelineAfterExtending: Story = {
  name: 'B · Timeline, after extending',
  render: () => (
    <SettingsOverMeetingRoom stateKey="afterExtending">
      <MeetingTabTimeline />
    </SettingsOverMeetingRoom>
  ),
};

/**
 * C: radio cards with the end time each option leads to, and an empty history.
 */
export const CRadioCardsCanExtend: Story = {
  name: 'C · Radio cards, can extend',
  render: () => (
    <SettingsOverMeetingRoom stateKey="canExtend">
      <MeetingTabRadioCards />
    </SettingsOverMeetingRoom>
  ),
};

/**
 * C at the cap: every card is disabled; the history lists the three extensions.
 */
export const CRadioCardsAtCap: Story = {
  name: 'C · Radio cards, at the cap',
  render: () => (
    <SettingsOverMeetingRoom stateKey="atCap">
      <MeetingTabRadioCards />
    </SettingsOverMeetingRoom>
  ),
};

/**
 * C for a guest: the cards are visible but disabled.
 */
export const CRadioCardsGuest: Story = {
  name: 'C · Radio cards, guest',
  render: () => (
    <SettingsOverMeetingRoom stateKey="guest">
      <MeetingTabRadioCards />
    </SettingsOverMeetingRoom>
  ),
};

/**
 * C right after extending by 20 minutes: the confirmation and the new history entry.
 */
export const CRadioCardsAfterExtending: Story = {
  name: 'C · Radio cards, after extending',
  render: () => (
    <SettingsOverMeetingRoom stateKey="afterExtending">
      <MeetingTabRadioCards />
    </SettingsOverMeetingRoom>
  ),
};
