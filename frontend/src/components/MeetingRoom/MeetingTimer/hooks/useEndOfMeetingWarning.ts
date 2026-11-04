import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { notifications$ } from '@core/stores';

const endOfMeetingWarningMilliseconds = 10_000;

/**
 * Tells everyone once that the meeting is about to finish.
 */
const useEndOfMeetingWarning = ({ shouldWarn }: { shouldWarn: boolean }) => {
  const { t } = useTranslation();
  const hasWarnedRef = useRef(false);

  useEffect(() => {
    if (!shouldWarn || hasWarnedRef.current) return;

    hasWarnedRef.current = true;
    notifications$.actions.push({
      type: 'warning',
      message: t('meetingTimer.endingSoon'),
      expirationMs: endOfMeetingWarningMilliseconds,
    });
  }, [shouldWarn, t]);
};

export default useEndOfMeetingWarning;
