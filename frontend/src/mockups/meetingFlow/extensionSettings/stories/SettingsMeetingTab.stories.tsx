import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement } from 'react';
import { AdvancedSettingsGeneralTab } from '@components/AdvancedSettingsDialog/components/AdvancedSettingsGeneralTab';
import mockupMeta, { type MockupArgs } from '../../storybook/mockupMeta';
import MeetingRoomWithMeetingTimer from '../components/MeetingRoomWithMeetingTimer';
import SettingsDialogMockup from '../components/SettingsDialogMockup';
import MeetingTab, { type MeetingTabProps } from '../meetingTab/MeetingTab';
import type { SampleMeetingTabStateKey } from './sampleMeetingTabStates';
import WithMeetingTabState from './WithMeetingTabState';

const meta = {
  title: 'Mockups/Meeting flow/8. Settings meeting tab',
  ...mockupMeta,
} satisfies Meta<MockupArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

const MeetingTabOverMeetingRoom = ({
  stateKey,
  ...meetingTabProps
}: MeetingTabProps & { stateKey: SampleMeetingTabStateKey }): ReactElement => (
  <WithMeetingTabState stateKey={stateKey}>
    <MeetingRoomWithMeetingTimer />
    <SettingsDialogMockup hasMeetingTab>
      <MeetingTab {...meetingTabProps} />
    </SettingsDialogMockup>
  </WithMeetingTabState>
);

/**
 * Signed in at 3:56 PM: the bar runs from 3:00 to 4:00 PM, 4 min left, and Extend under it.
 */
export const SimpleCanExtend: Story = {
  name: 'Simple · Can extend',
  render: () => (
    <MeetingTabOverMeetingRoom stateKey="canExtend" initialStep="overview" initialMinutes={null} />
  ),
};

/**
 * After Extend: the popup's second step, inline in the tab, with 20 min chosen.
 */
export const SimpleChoosingDuration: Story = {
  name: 'Simple · Choosing a duration',
  render: () => (
    <MeetingTabOverMeetingRoom
      stateKey="canExtend"
      initialStep="chooseDuration"
      initialMinutes={20}
    />
  ),
};

/**
 * At 5:56 PM after 2 h of extensions: no Extend button, only a muted line.
 */
export const SimpleAtCap: Story = {
  name: 'Simple · At the cap',
  render: () => (
    <MeetingTabOverMeetingRoom stateKey="atCap" initialStep="overview" initialMinutes={null} />
  ),
};

/**
 * A guest sees the bar and "Sign in to extend this meeting." instead of Extend.
 */
export const SimpleGuest: Story = {
  name: 'Simple · Guest',
  render: () => (
    <MeetingTabOverMeetingRoom stateKey="guest" initialStep="overview" initialMinutes={null} />
  ),
};

/**
 * A meeting without a schedule has no Meeting tab; Settings opens on General as today.
 */
export const SimpleUnscheduled: Story = {
  name: 'Simple · Unscheduled, no Meeting tab',
  render: () => (
    <WithMeetingTabState stateKey="unscheduled">
      <MeetingRoomWithMeetingTimer />
      <SettingsDialogMockup hasMeetingTab={false}>
        <AdvancedSettingsGeneralTab />
      </SettingsDialogMockup>
    </WithMeetingTabState>
  ),
};
