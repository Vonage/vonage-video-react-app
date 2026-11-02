import type { ReactNode } from 'react';
import type { WizardStep } from '../../types/WizardStep';

export type WizardStepPanelProps = {
  step: WizardStep;
  summary?: string;
  children: ReactNode;
};

/**
 * Content of one wizard step. The wizard shell decides when and where it is shown.
 */
const WizardStepPanel = ({ children }: WizardStepPanelProps): ReactNode => {
  return children;
};

WizardStepPanel.displayName = 'Wizard.Step';

export default WizardStepPanel;
