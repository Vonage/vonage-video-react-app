import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import CreateRoomWizardStep, { type CreateRoomWizardStepProps } from '../CreateRoomWizardStep';

/**
 * Returns the `CreateRoomWizard.Step` children of the wizard, in order.
 */
function getStepPanels(children: ReactNode): ReactElement<CreateRoomWizardStepProps>[] {
  return Children.toArray(children).filter(
    (child): child is ReactElement<CreateRoomWizardStepProps> =>
      isValidElement(child) && child.type === CreateRoomWizardStep
  );
}

export default getStepPanels;
