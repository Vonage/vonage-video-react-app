import type { Meta, StoryObj } from '@storybook/react';
import mockupMeta, { type MockupArgs } from '../../storybook/mockupMeta';
import CreateRoomWizardA from '../variants/CreateRoomWizardA';
import CreateRoomWizardB from '../variants/CreateRoomWizardB';
import CreateRoomWizardC from '../variants/CreateRoomWizardC';
import sampleWizardStates from './sampleWizardStates';
import WizardStoryFrame from './WizardStoryFrame';

const meta = {
  title: 'Mockups/Meeting flow/4. Wizard, roles',
  ...mockupMeta,
} satisfies Meta<MockupArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A: one switch per role, in the Advanced settings style, behind a master switch.
 */
export const ASwitchList: Story = {
  name: 'A · Sidebar, switches',
  render: () => <WizardStoryFrame wizard={CreateRoomWizardA} state={sampleWizardStates.roles} />,
};

/**
 * B: selectable role cards that list what each person can and cannot do.
 */
export const BRoleCards: Story = {
  name: 'B · Stepper, role cards',
  render: () => <WizardStoryFrame wizard={CreateRoomWizardB} state={sampleWizardStates.roles} />,
};

/**
 * C: permission table comparing every role, moderator row locked.
 */
export const CPermissionTable: Story = {
  name: 'C · Accordion, permission table',
  render: () => <WizardStoryFrame wizard={CreateRoomWizardC} state={sampleWizardStates.roles} />,
};
