import type { PropsWithChildren, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import classNames from 'classnames';
import VividIcon from '@ui/components/VividIcon';
import WizardFooterActions from '../../components/WizardFooterActions';
import createRoomWizard$ from '../../context/createRoomWizardContext';
import type { WizardStep } from '../../types/WizardStep';

export type AccordionSectionState = 'done' | 'active' | 'upcoming';

type AccordionWizardSectionProps = PropsWithChildren<{
  step: WizardStep;
  position: number;
  summary: string;
  sectionState: AccordionSectionState;
}>;

/**
 * One accordion section: expanded while active, a summary line with Edit once done, dimmed before it is reached.
 */
const AccordionWizardSection = ({
  step,
  position,
  summary,
  sectionState,
  children,
}: AccordionWizardSectionProps): ReactElement => {
  const { t } = useTranslation();
  const { goToStep } = createRoomWizard$.use.actions();
  const isActive = sectionState === 'active';
  const isDone = sectionState === 'done';

  return (
    <li
      className={classNames('flex flex-col gap-4 rounded-vera-large border p-4', {
        'border-vera-primary bg-vera-surface': isActive,
        'border-vera-border bg-vera-surface': isDone,
        'border-vera-border bg-vera-background': sectionState === 'upcoming',
      })}
    >
      <div className="flex items-center gap-3">
        <span
          className={classNames(
            'flex size-7 shrink-0 items-center justify-center rounded-full font-vera-plain text-vera-caption-semibold',
            {
              'bg-vera-primary text-vera-on-primary': isActive || isDone,
              'border border-vera-border text-vera-text-tertiary': sectionState === 'upcoming',
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
            position
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className={classNames('font-vera-plain text-vera-body-extended-semibold', {
              'text-vera-text-secondary': sectionState !== 'upcoming',
              'text-vera-text-tertiary': sectionState === 'upcoming',
            })}
          >
            {t(`meetingFlow.wizard.step.${step}`)}
          </span>
          <span className="truncate font-vera-plain text-vera-caption text-vera-text-tertiary">
            {isDone ? summary : t(`meetingFlow.wizard.step.${step}.description`)}
          </span>
        </div>
        {isDone && (
          <Button variant="text" size="small" onClick={() => goToStep(step)}>
            {t('meetingFlow.common.edit')}
          </Button>
        )}
      </div>
      {isActive && (
        <>
          {children}
          <div className="flex flex-wrap justify-end gap-3 border-t border-vera-border pt-4">
            <WizardFooterActions />
          </div>
        </>
      )}
    </li>
  );
};

export default AccordionWizardSection;
