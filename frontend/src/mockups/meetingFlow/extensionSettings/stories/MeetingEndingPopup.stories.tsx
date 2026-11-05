import type { Meta, StoryObj } from '@storybook/react';
import { useTranslation } from 'react-i18next';
import type { ReactElement } from 'react';
import NotificationItem from '@ui/components/NotificationItem';
import type { NotificationId } from '@core/stores/notifications';
import mockupMeta, { type MockupArgs } from '../../storybook/mockupMeta';
import MeetingRoomWithMeetingTimer from '../components/MeetingRoomWithMeetingTimer';
import MeetingEndingPopup from '../meetingEnding/MeetingEndingPopup';
import WithMeetingTabState from './WithMeetingTabState';

const meta = {
  title: 'Mockups/Meeting flow/9. Meeting ending popup',
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
 * At 3:56 PM a signed-in participant gets "Meeting ending" with Got it and Extend.
 */
export const SimpleStep1: Story = {
  name: 'Simple · Step 1',
  render: () => (
    <WithMeetingTabState stateKey="canExtend">
      <MeetingRoomWithMeetingTimer />
      <MeetingEndingPopup initialStep="notice" initialMinutes={null} />
    </WithMeetingTabState>
  ),
};

/**
 * After Extend, the same dialog asks how long, with 20 min chosen.
 */
export const SimpleStep2: Story = {
  name: 'Simple · Step 2, 20 min chosen',
  render: () => (
    <WithMeetingTabState stateKey="canExtend">
      <MeetingRoomWithMeetingTimer />
      <MeetingEndingPopup initialStep="chooseDuration" initialMinutes={20} />
    </WithMeetingTabState>
  ),
};

/**
 * After 80 min of extensions only 40 min are left under the cap, so 60 min is disabled; nothing is chosen yet.
 */
export const SimpleStep2NearCap: Story = {
  name: 'Simple · Step 2, near the cap',
  render: () => (
    <WithMeetingTabState stateKey="nearCap">
      <MeetingRoomWithMeetingTimer />
      <MeetingEndingPopup initialStep="chooseDuration" initialMinutes={null} />
    </WithMeetingTabState>
  ),
};

/**
 * Once the 2 h cap is used the popup has one step and a single Got it.
 */
export const SimpleAtCap: Story = {
  name: 'Simple · At the cap',
  render: () => (
    <WithMeetingTabState stateKey="atCap">
      <MeetingRoomWithMeetingTimer />
      <MeetingEndingPopup initialStep="notice" initialMinutes={null} />
    </WithMeetingTabState>
  ),
};

/**
 * Guests keep today's toast and the toolbar timer; no popup.
 */
export const SimpleGuestToast: Story = {
  name: 'Simple · Guest toast',
  render: () => (
    <WithMeetingTabState stateKey="guest">
      <MeetingRoomWithMeetingTimer>
        <GuestToast />
      </MeetingRoomWithMeetingTimer>
    </WithMeetingTabState>
  ),
};
