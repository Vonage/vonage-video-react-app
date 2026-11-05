import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import useMeetingTabCopy from '../hooks/useMeetingTabCopy';
import EndingSoonDialog from './components/EndingSoonDialog';

/**
 * Ending-soon popup once the 2 h cap is used: no extend option, only an acknowledgement.
 */
const EndingSoonAtCap = (): ReactElement => {
  const { t } = useTranslation();
  const { endsAtLabel, maxLabel } = useMeetingTabCopy();

  return (
    <EndingSoonDialog
      actions={<Button variant="contained">{t('meetingFlow.endingSoon.ok')}</Button>}
    >
      <p className="font-vera-plain text-vera-body-base text-vera-text-tertiary">
        {t('meetingFlow.endingSoon.atCapBody', { max: maxLabel, time: endsAtLabel })}
      </p>
    </EndingSoonDialog>
  );
};

export default EndingSoonAtCap;
