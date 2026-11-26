import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import WizardStepPanel, { type WizardStepPanelProps } from '../WizardStepPanel';

/**
 * Returns the `Wizard.Step` children of a wizard shell, in order.
 */
function getStepPanels(children: ReactNode): ReactElement<WizardStepPanelProps>[] {
  return Children.toArray(children).filter(
    (child): child is ReactElement<WizardStepPanelProps> =>
      isValidElement(child) && child.type === WizardStepPanel
  );
}

export default getStepPanels;
