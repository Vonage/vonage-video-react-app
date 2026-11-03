import type { Meta, StoryObj } from '@storybook/react';
import mockupMeta, { type MockupArgs } from '../../storybook/mockupMeta';
import CreateRoomWizardA from '../variants/CreateRoomWizardA';
import CreateRoomWizardB from '../variants/CreateRoomWizardB';
import CreateRoomWizardC from '../variants/CreateRoomWizardC';
import sampleWizardStates from './sampleWizardStates';
import WizardStoryFrame from './WizardStoryFrame';

const meta = {
  title: 'Mockups/Meeting flow/4. Wizard, share',
  ...mockupMeta,
} satisfies Meta<MockupArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A: the meeting link first with copy and share-as-image; the QR code unfolds underneath.
 */
export const ALinkFirst: Story = {
  name: 'A · Sidebar, link first',
  render: () => <WizardStoryFrame wizard={CreateRoomWizardA} state={sampleWizardStates.share} />,
};

/**
 * B: a large QR code to scan straight from the screen, with the link to copy underneath.
 */
export const BQrFirst: Story = {
  name: 'B · Stepper, QR first',
  render: () => <WizardStoryFrame wizard={CreateRoomWizardB} state={sampleWizardStates.share} />,
};

/**
 * C: a preview of the invitation people receive, with copy and share-as-image under it.
 */
export const CInvitePreview: Story = {
  name: 'C · Accordion, invitation preview',
  render: () => <WizardStoryFrame wizard={CreateRoomWizardC} state={sampleWizardStates.share} />,
};
