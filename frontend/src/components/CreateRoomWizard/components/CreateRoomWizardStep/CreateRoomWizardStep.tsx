import type { ReactNode } from 'react';
import type { CreateRoomWizardStepName } from '../../types/CreateRoomWizardStepName';

export type CreateRoomWizardStepProps = {
  step: CreateRoomWizardStepName;
  children: ReactNode;
};

/**
 * Content of one wizard step. The wizard dialog decides when it is shown.
 */
const CreateRoomWizardStep = ({ children }: CreateRoomWizardStepProps): ReactNode => children;

CreateRoomWizardStep.displayName = 'CreateRoomWizard.Step';

export default CreateRoomWizardStep;
