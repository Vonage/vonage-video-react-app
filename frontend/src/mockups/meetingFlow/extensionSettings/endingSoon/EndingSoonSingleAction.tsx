import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import useMeetingTabCopy from '../hooks/useMeetingTabCopy';
import EndingSoonDialog from './components/EndingSoonDialog';

/**
 * Ending-soon popup B: one primary "Extend 20 min"; "More options" opens Settings > Meeting.
 */
const EndingSoonSingleAction = (): ReactElement => {
  const { t } = useTranslation();
  const { endsAtLabel, optionCopies } = useMeetingTabCopy();
  const shortestOption = optionCopies[0];

  return (
    <EndingSoonDialog
      actions={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="text" className="sm:mr-auto!">
            {t('meetingFlow.common.notNow')}
          </Button>
          <Button variant="outlined">{t('meetingFlow.endingSoon.moreOptions')}</Button>
          <Button variant="contained">
            {t('meetingFlow.endingSoon.extendBy', { count: shortestOption.minutes })}
          </Button>
        </div>
      }
    >
      <p className="font-vera-plain text-vera-body-base text-vera-text-tertiary">
        {t('meetingFlow.endingSoon.singleActionBody', {
          time: endsAtLabel,
          count: shortestOption.minutes,
          newTime: shortestOption.endsAtLabel,
        })}
      </p>
    </EndingSoonDialog>
  );
};

export default EndingSoonSingleAction;
