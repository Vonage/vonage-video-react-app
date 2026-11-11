import type { PropsWithChildren, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import DialogFrame from '../../components/DialogFrame';
import WizardFooterActions from '../components/WizardFooterActions';
import WizardStepPanel, { getStepPanels } from '../components/WizardStepPanel';
import wizardSteps from '../constants/wizardSteps';
import createRoomWizard$ from '../context/createRoomWizardContext';

/**
 * Wizard shell B: a compact single-column dialog with a segmented progress bar under the title.
 */
const StepperWizard = ({ children }: PropsWithChildren): ReactElement => {
  const { t } = useTranslation();
  const activeStep = createRoomWizard$.use.select((state) => state.activeStep);
  const activeIndex = wizardSteps.indexOf(activeStep);
  const activePanel = getStepPanels(children).find(({ props }) => props.step === activeStep);

  return (
    <DialogFrame title={t('meetingFlow.wizard.title')} size="compact">
      <div className="flex flex-col gap-2 px-6 pt-4">
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-vera-plain text-vera-body-base-semibold text-vera-text-secondary">
            {t(`meetingFlow.wizard.step.${activeStep}`)}
          </span>
          <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
            {t('meetingFlow.wizard.stepOf', {
              current: activeIndex + 1,
              total: wizardSteps.length,
            })}
          </span>
        </div>
        <div className="flex gap-1" aria-hidden>
          {wizardSteps.map((step, index) => (
            <span
              key={step}
              className={classNames('h-1 flex-1 rounded-full', {
                'bg-vera-primary': index <= activeIndex,
                'bg-vera-border': index > activeIndex,
              })}
            />
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{activePanel}</div>
      <DialogFrame.Footer>
        <WizardFooterActions />
      </DialogFrame.Footer>
    </DialogFrame>
  );
};

/**
 * One step of the wizard.
 */
StepperWizard.Step = WizardStepPanel;

export default StepperWizard;
