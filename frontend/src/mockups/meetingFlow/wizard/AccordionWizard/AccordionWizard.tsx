import type { PropsWithChildren, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import DialogFrame from '../../components/DialogFrame';
import WizardStepPanel, { getStepPanels } from '../components/WizardStepPanel';
import wizardSteps from '../constants/wizardSteps';
import createRoomWizard$ from '../context/createRoomWizardContext';
import AccordionWizardSection from './components/AccordionWizardSection';

/**
 * Wizard shell C: every step stays on one page; finished steps fold into a one-line summary with Edit.
 */
const AccordionWizard = ({ children }: PropsWithChildren): ReactElement => {
  const { t } = useTranslation();
  const activeStep = createRoomWizard$.use.select((state) => state.activeStep);
  const activeIndex = wizardSteps.indexOf(activeStep);

  return (
    <DialogFrame title={t('meetingFlow.wizard.title')} size="tall">
      <ol className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-6">
        {getStepPanels(children).map((panel) => {
          const index = wizardSteps.indexOf(panel.props.step);
          const sectionState = (() => {
            if (index < activeIndex) return 'done';
            if (index === activeIndex) return 'active';
            return 'upcoming';
          })();

          return (
            <AccordionWizardSection
              key={panel.props.step}
              step={panel.props.step}
              position={index + 1}
              summary={panel.props.summary ?? ''}
              sectionState={sectionState}
            >
              {panel}
            </AccordionWizardSection>
          );
        })}
      </ol>
    </DialogFrame>
  );
};

/**
 * One step of the wizard. `summary` is shown once the step is done.
 */
AccordionWizard.Step = WizardStepPanel;

export default AccordionWizard;
