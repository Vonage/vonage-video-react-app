import type { ReactElement } from 'react';
import StepperWizard from '../StepperWizard';
import DetailsSwitchChips from '../steps/details/DetailsSwitchChips';
import ShareQrFirst from '../steps/share/ShareQrFirst';

/**
 * Wizard B: compact stepper shell, a switch and chips for the schedule, a large QR code first.
 */
const CreateRoomWizardB = (): ReactElement => (
  <StepperWizard>
    <StepperWizard.Step step="details">
      <DetailsSwitchChips />
    </StepperWizard.Step>
    <StepperWizard.Step step="share">
      <ShareQrFirst />
    </StepperWizard.Step>
  </StepperWizard>
);

export default CreateRoomWizardB;
