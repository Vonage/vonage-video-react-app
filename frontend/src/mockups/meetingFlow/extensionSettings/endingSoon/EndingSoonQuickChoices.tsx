import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import disabledButtonClassName from '../../constants/disabledButtonClassName';
import useMeetingTabCopy from '../hooks/useMeetingTabCopy';
import EndingSoonDialog from './components/EndingSoonDialog';

/**
 * Ending-soon popup A: one tap on +20, +40 or +60 extends right away; each choice says the new end time.
 */
const EndingSoonQuickChoices = (): ReactElement => {
  const { t } = useTranslation();
  const { endsAtLabel, optionCopies } = useMeetingTabCopy();

  return (
    <EndingSoonDialog actions={<Button variant="text">{t('meetingFlow.common.notNow')}</Button>}>
      <p className="font-vera-plain text-vera-body-base text-vera-text-tertiary">
        {t('meetingFlow.endingSoon.quickChoicesBody', { time: endsAtLabel })}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {optionCopies.map(({ minutes, label, resultLabel, isAvailable }) => (
          <Button
            key={minutes}
            variant="outlined"
            disabled={!isAvailable}
            className={`h-auto! justify-between! gap-0.5 px-4! py-2! sm:flex-col! sm:justify-center! ${disabledButtonClassName}`}
          >
            <span className="font-vera-plain text-vera-body-base-semibold">{label}</span>
            <span className="whitespace-nowrap font-vera-plain text-vera-caption normal-case text-vera-text-tertiary">
              {resultLabel}
            </span>
          </Button>
        ))}
      </div>
    </EndingSoonDialog>
  );
};

export default EndingSoonQuickChoices;
