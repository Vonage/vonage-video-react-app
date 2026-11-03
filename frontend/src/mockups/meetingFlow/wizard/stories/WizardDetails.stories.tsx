import type { Meta, StoryObj } from '@storybook/react';
import mockupMeta, { type MockupArgs } from '../../storybook/mockupMeta';
import CreateRoomWizardA from '../variants/CreateRoomWizardA';
import CreateRoomWizardB from '../variants/CreateRoomWizardB';
import CreateRoomWizardC from '../variants/CreateRoomWizardC';
import sampleWizardStates from './sampleWizardStates';
import WizardStoryFrame from './WizardStoryFrame';

const meta = {
  title: 'Mockups/Meeting flow/3. Wizard, name and schedule',
  ...mockupMeta,
} satisfies Meta<MockupArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A: sidebar wizard; two radio cards pick "No schedule" or "Scheduled"; fields in a two-column grid.
 */
export const AChoiceCards: Story = {
  name: 'A · Sidebar, choice cards',
  render: () => (
    <WizardStoryFrame wizard={CreateRoomWizardA} state={sampleWizardStates.detailsScheduled} />
  ),
};

/**
 * A, with no schedule: the warning explains the link never expires.
 */
export const AChoiceCardsUnscheduled: Story = {
  name: 'A · Sidebar, no schedule warning',
  render: () => (
    <WizardStoryFrame wizard={CreateRoomWizardA} state={sampleWizardStates.detailsUnscheduled} />
  ),
};

/**
 * B: compact stepper; a switch reveals the schedule; duration and repeat are chips.
 */
export const BSwitchChips: Story = {
  name: 'B · Stepper, switch and chips',
  render: () => (
    <WizardStoryFrame wizard={CreateRoomWizardB} state={sampleWizardStates.detailsScheduled} />
  ),
};

/**
 * B, with no schedule.
 */
export const BSwitchChipsUnscheduled: Story = {
  name: 'B · Stepper, no schedule warning',
  render: () => (
    <WizardStoryFrame wizard={CreateRoomWizardB} state={sampleWizardStates.detailsUnscheduled} />
  ),
};

/**
 * C: accordion; a single "When" select drives the form and a sentence confirms the choice.
 */
export const CWhenSelect: Story = {
  name: 'C · Accordion, "When" select',
  render: () => (
    <WizardStoryFrame wizard={CreateRoomWizardC} state={sampleWizardStates.detailsScheduled} />
  ),
};

/**
 * C, with no schedule.
 */
export const CWhenSelectUnscheduled: Story = {
  name: 'C · Accordion, no schedule warning',
  render: () => (
    <WizardStoryFrame wizard={CreateRoomWizardC} state={sampleWizardStates.detailsUnscheduled} />
  ),
};
