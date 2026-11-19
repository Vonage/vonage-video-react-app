import { useTranslation } from 'react-i18next';
import formatMeetingDate from '../../helpers/formatMeetingDate';
import getExtensionOptions from '../../helpers/getExtensionOptions';
import useLocale from '../../hooks/useLocale';
import meetingExtension$ from '../../extension/context/meetingExtensionContext';
import extensionViewer$ from '../context/extensionViewerContext';
import formatDurationMinutes from '../helpers/formatDurationMinutes';

const useMeetingNumbers = meetingExtension$.use.createSelectorHook(
  ({ scheduledEnd, extendedMinutes, maxTotalMinutes, options, now }) => ({
    scheduledEnd,
    extendedMinutes,
    maxTotalMinutes,
    options,
    now,
  })
);

const useScheduledStart = extensionViewer$.use.createSelectorHook(
  ({ scheduledStart }) => scheduledStart
);

/**
 * Words and numbers for the Settings > Meeting tab and the meeting ending popup.
 */
const useMeetingTabCopy = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { scheduledEnd, extendedMinutes, maxTotalMinutes, options, now } = useMeetingNumbers();
  const scheduledStart = useScheduledStart();

  const formatTime = (date: Date) => formatMeetingDate({ date, locale, format: 'time' });
  const endsAt = new Date(scheduledEnd.getTime() + extendedMinutes * 60_000);
  const secondsLeft = Math.max(0, Math.round((endsAt.getTime() - now.getTime()) / 1000));
  const totalMilliseconds = endsAt.getTime() - scheduledStart.getTime();
  const elapsedMilliseconds = now.getTime() - scheduledStart.getTime();

  return {
    startLabel: formatTime(scheduledStart),
    endsAtLabel: formatTime(endsAt),
    elapsedPercent: Math.min(100, (elapsedMilliseconds / totalMilliseconds) * 100),
    timeLeftLabel: t('meetingFlow.meetingTab.timeLeft', {
      duration: formatDurationMinutes({ minutes: Math.ceil(secondsLeft / 60), t }),
    }),
    durationChoices: getExtensionOptions({ options, maxTotalMinutes, extendedMinutes }).map(
      (option) => ({
        ...option,
        label: t('meetingFlow.duration.minutes', { minutes: option.minutes }),
      })
    ),
    isAtCap: extendedMinutes >= maxTotalMinutes,
    isEndingSoon: secondsLeft <= 300,
    timerLabel: t('meetingFlow.meetingTimer.timeLeft', {
      timeLeft: t('meetingFlow.meetingTimer.minutesAndSeconds', {
        minutes: Math.floor(secondsLeft / 60),
        seconds: secondsLeft % 60,
      }),
    }),
  };
};

export default useMeetingTabCopy;
