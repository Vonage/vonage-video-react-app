import type { ReactElement } from 'react';
import StepperWizard from '../StepperWizard';
import DetailsSwitchChips from '../steps/details/DetailsSwitchChips';
import RolesCards from '../steps/roles/RolesCards';
import ShareRoleTabs from '../steps/share/ShareRoleTabs';

/**
 * Wizard B: compact stepper shell, a switch and chips for the schedule, role cards, tabbed QR codes.
 */
const CreateRoomWizardB = (): ReactElement => (
  <StepperWizard>
    <StepperWizard.Step step="details">
      <DetailsSwitchChips />
    </StepperWizard.Step>
    <StepperWizard.Step step="roles">
      <RolesCards />
    </StepperWizard.Step>
    <StepperWizard.Step step="share">
      <ShareRoleTabs initialRole="publisher" />
    </StepperWizard.Step>
  </StepperWizard>
);

export default CreateRoomWizardB;
