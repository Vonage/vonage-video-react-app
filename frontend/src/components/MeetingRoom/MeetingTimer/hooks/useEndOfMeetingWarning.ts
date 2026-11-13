import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { isNil } from '@common/assertions';
import { notifications$, serverSettings$ } from '@core/stores';
import type { NotificationId } from '@core/stores/notifications/types';

const endOfMeetingWarningMilliseconds = 10_000;
const endingSoonSeconds = 5 * 60;

const useEndOfMeetingWarning = () => {
  const { t } = useTranslation();
  const scheduleWindow = serverSettings$.useScheduleWindow();
  const serverSettings = serverSettings$.use.api();
  const endsAtMs = scheduleWindow?.endsAtMs;

  const showWarning = useEffectEvent(function showEndOfMeetingWarning() {
    return notifications$.actions.push({
      type: 'warning',
      message: t('meetingTimer.endingSoon'),
      expirationMs: endOfMeetingWarningMilliseconds,
    });
  });

  useEffect(
    function subscribeToEndOfMeetingWarning() {
      if (isNil(endsAtMs)) return;

      let notificationId: NotificationId | undefined;
      const unsubscribe = serverSettings.subscribe(
        serverSettings$.selectors.secondsUntilEnd,
        warnIfEndingSoon,
        { skipFirst: true }
      );

      function warnIfEndingSoon(secondsUntilEnd: number | null) {
        if (isNil(secondsUntilEnd)) return;

        const hasReachedWarningWindow = secondsUntilEnd <= endingSoonSeconds;
        const hasMeetingEnded = secondsUntilEnd === 0;
        if (!hasReachedWarningWindow || hasMeetingEnded) return;

        unsubscribe();
        notificationId = showWarning();
      }

      warnIfEndingSoon(serverSettings$.selectors.secondsUntilEnd(serverSettings.getState()));

      return function dismissEndOfMeetingWarning() {
        unsubscribe();
        if (isNil(notificationId)) return;

        notifications$.actions.dismiss(notificationId);
      };
    },
    [serverSettings, endsAtMs]
  );
};

export default useEndOfMeetingWarning;
