import type { Meta, StoryObj } from '@storybook/react';
import { useTranslation } from 'react-i18next';
import type { ReactElement } from 'react';
import NotificationItem from '@ui/components/NotificationItem';
import type { NotificationId } from '@core/stores/notifications';
import mockupMeta, { type MockupArgs } from '../../storybook/mockupMeta';
import MeetingRoomWithMeetingTimer from '../components/MeetingRoomWithMeetingTimer';
import SettingsDialogMockup from '../components/SettingsDialogMockup';
import EndingSoonAtCap from '../endingSoon/EndingSoonAtCap';
import EndingSoonQuickChoices from '../endingSoon/EndingSoonQuickChoices';
import EndingSoonSingleAction from '../endingSoon/EndingSoonSingleAction';
import MeetingTabRows from '../variants/MeetingTabRows/MeetingTabRows';
import WithMeetingTabState from './WithMeetingTabState';

const meta = {
  title: 'Mockups/Meeting flow/9. Ending soon popup',
  ...mockupMeta,
} satisfies Meta<MockupArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

const GuestToast = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="absolute right-3 top-4 flex max-sm:left-3">
      <NotificationItem
        id={'notification:meeting-ending-soon' as NotificationId}
        type="warning"
        message={t('meetingFlow.meetingTimer.endingSoon')}
        expirationMs={null}
        onDismiss={() => {}}
      />
    </div>
  );
};

/**
 * A: at 3:56 PM a signed-in participant gets a central popup with +20, +40 and +60 and "Not now".
 */
export const AQuickChoices: Story = {
  name: 'A · Quick choices',
  render: () => (
    <WithMeetingTabState stateKey="canExtend">
      <MeetingRoomWithMeetingTimer />
      <EndingSoonQuickChoices />
    </WithMeetingTabState>
  ),
};

/**
 * B: one primary "Extend 20 min"; "More options" opens Settings > Meeting; "Not now" closes it.
 */
export const BSingleAction: Story = {
  name: 'B · Single action',
  render: () => (
    <WithMeetingTabState stateKey="canExtend">
      <MeetingRoomWithMeetingTimer />
      <EndingSoonSingleAction />
    </WithMeetingTabState>
  ),
};

/**
 * B after "More options": the Settings dialog on the Meeting tab (variant A of screen 8).
 */
export const BSingleActionMoreOptions: Story = {
  name: 'B · Single action, More options opened',
  render: () => (
    <WithMeetingTabState stateKey="canExtend">
      <MeetingRoomWithMeetingTimer />
      <SettingsDialogMockup>
        <MeetingTabRows />
      </SettingsDialogMockup>
    </WithMeetingTabState>
  ),
};

/**
 * Both variants once the 2 h cap is used: the popup informs and offers only OK.
 */
export const AllAtCap: Story = {
  name: 'All · At the cap, OK only',
  render: () => (
    <WithMeetingTabState stateKey="atCap">
      <MeetingRoomWithMeetingTimer />
      <EndingSoonAtCap />
    </WithMeetingTabState>
  ),
};

/**
 * Guests keep today's toast and the toolbar timer; no popup.
 */
export const AllGuestToast: Story = {
  name: 'All · Guest keeps the toast',
  render: () => (
    <WithMeetingTabState stateKey="guest">
      <MeetingRoomWithMeetingTimer>
        <GuestToast />
      </MeetingRoomWithMeetingTimer>
    </WithMeetingTabState>
  ),
};
