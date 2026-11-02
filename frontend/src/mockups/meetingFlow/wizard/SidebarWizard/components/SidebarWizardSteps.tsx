import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import VividIcon from '@ui/components/VividIcon';
import wizardSteps from '../../constants/wizardSteps';
import createRoomWizard$ from '../../context/createRoomWizardContext';

/**
 * Step list in the sidebar: number or check mark, title and a short description.
 */
const SidebarWizardSteps = (): ReactElement => {
  const { t } = useTranslation();
  const activeStep = createRoomWizard$.use.select((state) => state.activeStep);
  const activeIndex = wizardSteps.indexOf(activeStep);

  return (
    <ol className="flex w-full flex-row gap-1 overflow-x-auto border-b border-vera-border bg-vera-background p-1 md:h-full md:w-60 md:flex-col md:gap-0.5 md:border-b-0 md:border-r">
      {wizardSteps.map((step, index) => {
        const isActive = index === activeIndex;
        const isDone = index < activeIndex;

        return (
          <li
            key={step}
            aria-current={isActive ? 'step' : undefined}
            className={classNames(
              'flex flex-1 shrink-0 items-center gap-3 rounded-xl px-3 py-3 md:flex-none',
              {
                'bg-vera-surface': isActive,
              }
            )}
          >
            <span
              className={classNames(
                'flex size-7 shrink-0 items-center justify-center rounded-full font-vera-plain text-vera-caption-semibold',
                {
                  'bg-vera-primary text-vera-on-primary': isActive || isDone,
                  'border border-vera-border text-vera-text-tertiary': !isActive && !isDone,
                }
              )}
            >
              {isDone ? (
                <VividIcon
                  name="check-line"
                  customSize={-6}
                  style={{ color: 'var(--vera-on-primary)' }}
                />
              ) : (
                index + 1
              )}
            </span>
            <span className="flex min-w-0 flex-col">
              <span
                className={classNames('font-vera-plain text-vera-body-base-semibold', {
                  'text-vera-text-secondary': isActive || isDone,
                  'text-vera-text-tertiary': !isActive && !isDone,
                })}
              >
                {t(`meetingFlow.wizard.step.${step}`)}
              </span>
              <span className="hidden font-vera-plain text-vera-caption text-vera-text-tertiary md:block">
                {t(`meetingFlow.wizard.step.${step}.description`)}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export default SidebarWizardSteps;
