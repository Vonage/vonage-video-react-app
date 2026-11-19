import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentType } from 'react';
import mockupMeta, { type MockupArgs } from '../../storybook/mockupMeta';
import sampleMeetings from '../../sampleData/sampleMeetings';
import SavedMeetingShareDialog, { savedMeetingToWizardState } from '../SavedMeetingShareDialog';
import ShareInvitePreview from '../steps/share/ShareInvitePreview';
import ShareLinkFirst from '../steps/share/ShareLinkFirst';
import ShareQrFirst from '../steps/share/ShareQrFirst';
import WizardStoryFrame from './WizardStoryFrame';

const meta = {
  title: 'Mockups/Meeting flow/5. Saved meeting reopened',
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

const ReopenedWithLinkFirst = withShareContent(function LinkFirstContent() {
  return <ShareLinkFirst isQrInitiallyOpen={false} />;
});

const ReopenedWithQrFirst = withShareContent(ShareQrFirst);

const ReopenedWithInvitePreview = withShareContent(ShareInvitePreview);

/**
 * Opening "Customer onboarding: Acme" from the list, with share content A.
 */
export const ALinkFirst: Story = {
  name: 'A · Link first',
  render: () => (
    <WizardStoryFrame
      wizard={ReopenedWithLinkFirst}
      state={savedMeetingToWizardState(acmeMeeting)}
    />
  ),
};

/**
 * The same meeting with share content B.
 */
export const BQrFirst: Story = {
  name: 'B · QR first',
  render: () => (
    <WizardStoryFrame wizard={ReopenedWithQrFirst} state={savedMeetingToWizardState(acmeMeeting)} />
  ),
};

/**
 * The same meeting with share content C.
 */
export const CInvitePreview: Story = {
  name: 'C · Invitation preview',
  render: () => (
    <WizardStoryFrame
      wizard={ReopenedWithInvitePreview}
      state={savedMeetingToWizardState(acmeMeeting)}
    />
  ),
};
