import type { Meta, StoryObj } from '@storybook/react';
import mockupMeta, { type MockupArgs } from '../../storybook/mockupMeta';
import CreateRoomWizardA from '../variants/CreateRoomWizardA';
import CreateRoomWizardB from '../variants/CreateRoomWizardB';
import CreateRoomWizardC from '../variants/CreateRoomWizardC';
import sampleWizardStates from './sampleWizardStates';
import WizardStoryFrame from './WizardStoryFrame';

const meta = {
  title: 'Mockups/Meeting flow/5. Wizard, share',
  ...mockupMeta,
} satisfies Meta<MockupArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A: a row per role with link, copy and share-as-image; the QR code unfolds inside the row.
 */
export const ALinkList: Story = {
  name: 'A · Sidebar, link list',
  render: () => <WizardStoryFrame wizard={CreateRoomWizardA} state={sampleWizardStates.share} />,
};

/**
 * B: one role per tab with a large QR code to scan straight from the screen.
 */
export const BRoleTabs: Story = {
  name: 'B · Stepper, tabbed QR',
  render: () => <WizardStoryFrame wizard={CreateRoomWizardB} state={sampleWizardStates.share} />,
};

/**
 * C: invitation cards, one per role, with QR thumbnail, link and image share.
 */
export const CInviteCards: Story = {
  name: 'C · Accordion, invitation cards',
  render: () => <WizardStoryFrame wizard={CreateRoomWizardC} state={sampleWizardStates.share} />,
};
