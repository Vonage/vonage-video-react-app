import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { notifications$ } from '@core/stores';

const endOfMeetingWarningMilliseconds = 10_000;

/**
 * Tells everyone once per end time that the meeting is about to finish.
 */
const useEndOfMeetingWarning = ({ endsAt }: { endsAt: number }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const notificationId = notifications$.actions.push({
      type: 'warning',
      message: t('meetingTimer.endingSoon'),
      expirationMs: endOfMeetingWarningMilliseconds,
    });

    return function dismissEndOfMeetingWarning() {
      notifications$.actions.dismiss(notificationId);
    };
  }, [endsAt, t]);
};

export default useEndOfMeetingWarning;
