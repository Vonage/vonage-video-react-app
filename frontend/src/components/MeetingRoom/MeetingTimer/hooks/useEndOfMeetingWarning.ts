import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { notifications$ } from '@core/stores';

const endOfMeetingWarningMilliseconds = 10_000;

const useEndOfMeetingWarning = ({ isEnabled }: { isEnabled: boolean }) => {
  const { t } = useTranslation();
  useEffect(() => {
    if (!isEnabled) return;

    const notificationId = notifications$.actions.push({
      type: 'warning',
      message: t('meetingTimer.endingSoon'),
      expirationMs: endOfMeetingWarningMilliseconds,
    });

    return function dismissEndOfMeetingWarning() {
      notifications$.actions.dismiss(notificationId);
    };
  }, [isEnabled, t]);
};

export default useEndOfMeetingWarning;
