import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import NotificationItem from '@ui/components/NotificationItem';
import type { NotificationId } from '@core/stores/notifications';
import mockupMeta, { type MockupArgs } from '../../storybook/mockupMeta';
import meetingExtension$ from '../context/meetingExtensionContext';
import MeetingRoomWithBanner from '../variants/MeetingRoomWithBanner';
import MeetingRoomWithTimer from '../variants/MeetingRoomWithTimer';
import MeetingRoomWithToast from '../variants/MeetingRoomWithToast';
import sampleExtensionStates, { type SampleExtensionStateKey } from './sampleExtensionStates';

const meta = {
  title: 'Mockups/Meeting flow/8. Meeting extension',
  ...mockupMeta,
} satisfies Meta<MockupArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

const WithState = ({
  stateKey,
  children,
}: {
  stateKey: SampleExtensionStateKey;
  children: ReactNode;
}): ReactElement => (
  <meetingExtension$.Provider value={(state) => ({ ...state, ...sampleExtensionStates[stateKey] })}>
    {children}
  </meetingExtension$.Provider>
);

const ExtendedToast = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="absolute inset-x-0 top-6 flex justify-center px-4">
      <NotificationItem
        id={'notification:meeting-extended' as NotificationId}
        type="success"
        message={t('meetingFlow.extension.extended', { count: 20, time: '3:20 PM' })}
        expirationMs={null}
        onDismiss={() => {}}
      />
    </div>
  );
};

/**
 * A: 5 minutes before the end, a card above the toolbar offers +20, +40 and +60.
 */
export const AToastPrompt: Story = {
  name: 'A · Toast, 5 min prompt',
  render: () => (
    <WithState stateKey="prompt">
      <MeetingRoomWithToast isMenuOpen={false} />
    </WithState>
  ),
};

/**
 * A after 80 minutes of extensions: +60 would pass the 2 h cap, so it is disabled.
 */
export const AToastPartiallyUsed: Story = {
  name: 'A · Toast, 80 of 120 min used',
  render: () => (
    <WithState stateKey="partiallyUsed">
      <MeetingRoomWithToast isMenuOpen={false} />
    </WithState>
  ),
};

/**
 * A at the cap: no prompt; the overflow menu entry is disabled and explains why.
 */
export const AToastAtCap: Story = {
  name: 'A · Toast, at cap (menu)',
  render: () => (
    <WithState stateKey="atCap">
      <MeetingRoomWithToast isMenuOpen />
    </WithState>
  ),
};

/**
 * A at any time: "Extend meeting" in the toolbar overflow menu.
 */
export const AToastAnytime: Story = {
  name: 'A · Toast, any time (menu)',
  render: () => (
    <WithState stateKey="anytimeClosed">
      <MeetingRoomWithToast isMenuOpen />
    </WithState>
  ),
};

/**
 * B: 5 minutes before the end, a slim bar at the top of the canvas with the options inline.
 */
export const BBannerPrompt: Story = {
  name: 'B · Banner, 5 min prompt',
  render: () => (
    <WithState stateKey="prompt">
      <MeetingRoomWithBanner />
    </WithState>
  ),
};

/**
 * B after 80 minutes of extensions.
 */
export const BBannerPartiallyUsed: Story = {
  name: 'B · Banner, 80 of 120 min used',
  render: () => (
    <WithState stateKey="partiallyUsed">
      <MeetingRoomWithBanner />
    </WithState>
  ),
};

/**
 * B at the cap: no banner; the end-time pill shows a lock.
 */
export const BBannerAtCap: Story = {
  name: 'B · Banner, at cap',
  render: () => (
    <WithState stateKey="atCap">
      <MeetingRoomWithBanner />
    </WithState>
  ),
};

/**
 * B at any time: the end-time pill next to the room name opens the same banner.
 */
export const BBannerAnytime: Story = {
  name: 'B · Banner, any time (end-time pill)',
  render: () => (
    <WithState stateKey="anytime">
      <MeetingRoomWithBanner />
    </WithState>
  ),
};

/**
 * C: 5 minutes before the end, the toolbar timer turns amber and opens its popover.
 */
export const CTimerPrompt: Story = {
  name: 'C · Timer, 5 min prompt',
  render: () => (
    <WithState stateKey="prompt">
      <MeetingRoomWithTimer />
    </WithState>
  ),
};

/**
 * C after 80 minutes of extensions.
 */
export const CTimerPartiallyUsed: Story = {
  name: 'C · Timer, 80 of 120 min used',
  render: () => (
    <WithState stateKey="partiallyUsed">
      <MeetingRoomWithTimer />
    </WithState>
  ),
};

/**
 * C at the cap: no prompt; the timer keeps counting with a lock icon.
 */
export const CTimerAtCap: Story = {
  name: 'C · Timer, at cap',
  render: () => (
    <WithState stateKey="atCap">
      <MeetingRoomWithTimer />
    </WithState>
  ),
};

/**
 * C at any time: the moderator opens the timer 40 minutes before the end.
 */
export const CTimerAnytime: Story = {
  name: 'C · Timer, any time',
  render: () => (
    <WithState stateKey="anytime">
      <MeetingRoomWithTimer />
    </WithState>
  ),
};

/**
 * After any variant: everyone sees a short confirmation with the new end time.
 */
export const ExtendedConfirmation: Story = {
  name: 'All · Confirmation after extending',
  render: () => (
    <WithState stateKey="anytimeClosed">
      <div className="relative">
        <MeetingRoomWithTimer />
        <ExtendedToast />
      </div>
    </WithState>
  ),
};
