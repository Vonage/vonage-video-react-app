import type { PropsWithChildren, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import DialogFrame from '../../components/DialogFrame';
import WizardFooterActions from '../components/WizardFooterActions';
import WizardStepPanel, { getStepPanels } from '../components/WizardStepPanel';
import createRoomWizard$ from '../context/createRoomWizardContext';
import SidebarWizardSteps from './components/SidebarWizardSteps';

/**
 * Wizard shell A: the Advanced settings layout, with the steps listed in a sidebar.
 */
const SidebarWizard = ({ children }: PropsWithChildren): ReactElement => {
  const { t } = useTranslation();
  const activeStep = createRoomWizard$.use.select((state) => state.activeStep);
  const activePanel = getStepPanels(children).find(({ props }) => props.step === activeStep);

  return (
    <DialogFrame title={t('meetingFlow.wizard.title')} size="tall">
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <SidebarWizardSteps />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{activePanel}</div>
      </div>
      <DialogFrame.Footer>
        <WizardFooterActions />
      </DialogFrame.Footer>
    </DialogFrame>
  );
};

/**
 * One step of the wizard.
 */
SidebarWizard.Step = WizardStepPanel;

export default SidebarWizard;
