import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { isNil } from '@common/assertions';
import { notifications$, serverSettings$ } from '@core/stores';
import type { NotificationId } from '@core/stores/notifications/types';
import useMeetingScheduleWindow from './useMeetingScheduleWindow';

const endOfMeetingWarningMilliseconds = 10_000;
const endingSoonMilliseconds = 5 * 60_000;

const useEndOfMeetingWarning = () => {
  const { t } = useTranslation();
  const scheduleWindow = useMeetingScheduleWindow();
  const serverSettingsApi = serverSettings$.use.api();
  const endsAtMs = scheduleWindow?.endsAtMs;
  const showWarning = useEffectEvent(() =>
    notifications$.actions.push({
      type: 'warning',
      message: t('meetingTimer.endingSoon'),
      expirationMs: endOfMeetingWarningMilliseconds,
    })
  );

  useEffect(() => {
    if (isNil(endsAtMs)) return;

    let notificationId: NotificationId | undefined;
    const isEndingSoon$ = serverSettingsApi.createObservable(
      (state) =>
        state.status === 'known' &&
        state.now >= endsAtMs - endingSoonMilliseconds &&
        state.now < endsAtMs
    );

    isEndingSoon$.subscribe((isEndingSoon) => {
      if (!isEndingSoon) return;

      isEndingSoon$.dispose();
      notificationId = showWarning();
    });

    return () => {
      isEndingSoon$.dispose();
      if (isNil(notificationId)) return;

      notifications$.actions.dismiss(notificationId);
    };
  }, [serverSettingsApi, endsAtMs]);
};

export default useEndOfMeetingWarning;
