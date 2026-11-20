import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import createRoomWizard$ from '../../context/createRoomWizardContext';
import createRoomWizardSteps from '../../constants/createRoomWizardSteps';

const WizardStepProgress = ({ className, ...props }: ComponentProps<'div'>): ReactElement => {
  const { t } = useTranslation();
  const activeStep = createRoomWizard$.use.select((state) => state.activeStep);
  const activeIndex = createRoomWizardSteps.indexOf(activeStep);

  return (
    <div className={classNames('flex flex-col gap-2', className)} {...props}>
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-vera-plain text-vera-body-base-semibold text-vera-text-secondary">
          {t(`createRoomWizard.step.${activeStep}`)}
        </span>
        <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
          {t('createRoomWizard.stepOf', {
            current: activeIndex + 1,
            total: createRoomWizardSteps.length,
          })}
        </span>
      </div>
      <div className="flex gap-1" aria-hidden>
        {createRoomWizardSteps.map((step, index) => (
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
  );
};

export default WizardStepProgress;
