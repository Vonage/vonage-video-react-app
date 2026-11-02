import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentType } from 'react';
import mockupMeta, { type MockupArgs } from '../../storybook/mockupMeta';
import sampleMeetings from '../../sampleData/sampleMeetings';
import SavedMeetingShareDialog, { savedMeetingToWizardState } from '../SavedMeetingShareDialog';
import ShareInviteCards from '../steps/share/ShareInviteCards';
import ShareLinkList from '../steps/share/ShareLinkList';
import ShareRoleTabs from '../steps/share/ShareRoleTabs';
import WizardStoryFrame from './WizardStoryFrame';

const meta = {
  title: 'Mockups/Meeting flow/6. Saved meeting reopened',
  ...mockupMeta,
} satisfies Meta<MockupArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

const acmeMeeting = sampleMeetings.find(({ name }) => name === 'Customer onboarding: Acme')!;

const withShareContent = (ShareContent: ComponentType) =>
  function ReopenedMeeting() {
    return (
      <SavedMeetingShareDialog>
        <ShareContent />
      </SavedMeetingShareDialog>
    );
  };

const ReopenedWithLinkList = withShareContent(function LinkListContent() {
  return <ShareLinkList initialQrRole={null} />;
});

const ReopenedWithRoleTabs = withShareContent(function RoleTabsContent() {
  return <ShareRoleTabs initialRole="subscriber" />;
});

const ReopenedWithInviteCards = withShareContent(ShareInviteCards);

/**
 * Opening "Customer onboarding: Acme" from the list, with share content A.
 */
export const ALinkList: Story = {
  name: 'A · Link list',
  render: () => (
    <WizardStoryFrame
      wizard={ReopenedWithLinkList}
      state={savedMeetingToWizardState(acmeMeeting)}
    />
  ),
};

/**
 * The same meeting with share content B.
 */
export const BRoleTabs: Story = {
  name: 'B · Tabbed QR',
  render: () => (
    <WizardStoryFrame
      wizard={ReopenedWithRoleTabs}
      state={savedMeetingToWizardState(acmeMeeting)}
    />
  ),
};

/**
 * The same meeting with share content C.
 */
export const CInviteCards: Story = {
  name: 'C · Invitation cards',
  render: () => (
    <WizardStoryFrame
      wizard={ReopenedWithInviteCards}
      state={savedMeetingToWizardState(acmeMeeting)}
    />
  ),
};
