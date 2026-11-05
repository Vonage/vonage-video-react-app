import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { notifications$ } from '@core/stores';

const endOfMeetingWarningMilliseconds = 10_000;

/**
 * Tells everyone once that the meeting is about to finish.
 */
const useEndOfMeetingWarning = () => {
  const { t } = useTranslation();
  const hasWarnedRef = useRef(false);

  useEffect(() => {
    if (hasWarnedRef.current) return;

    hasWarnedRef.current = true;
    notifications$.actions.push({
      type: 'warning',
      message: t('meetingTimer.endingSoon'),
      expirationMs: endOfMeetingWarningMilliseconds,
    });
  }, [t]);
};

export default useEndOfMeetingWarning;
