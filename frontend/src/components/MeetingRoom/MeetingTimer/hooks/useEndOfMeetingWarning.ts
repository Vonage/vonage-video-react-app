import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { notifications$ } from '@core/stores';

const endOfMeetingWarningMilliseconds = 10_000;

const useEndOfMeetingWarning = () => {
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
  }, [t]);
};

export default useEndOfMeetingWarning;
