import { useTranslation } from 'react-i18next';
import formatMeetingDate from '../../helpers/formatMeetingDate';
import getExtensionOptions from '../../helpers/getExtensionOptions';
import useLocale from '../../hooks/useLocale';
import meetingExtension$ from '../../extension/context/meetingExtensionContext';
import extensionViewer$ from '../context/extensionViewerContext';
import formatDurationMinutes from '../helpers/formatDurationMinutes';

const useMeetingNumbers = meetingExtension$.use.createSelectorHook(
  ({ meetingName, scheduledEnd, extendedMinutes, maxTotalMinutes, options, now }) => ({
    meetingName,
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
 * Words and numbers for the Settings > Meeting tab and the ending-soon popup.
 */
const useMeetingTabCopy = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { meetingName, scheduledEnd, extendedMinutes, maxTotalMinutes, options, now } =
    useMeetingNumbers();
  const scheduledStart = useScheduledStart();

  const formatTime = (date: Date) => formatMeetingDate({ date, locale, format: 'time' });
  const addMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60_000);
  const endsAt = addMinutes(scheduledEnd, extendedMinutes);
  const secondsLeft = Math.max(0, Math.round((endsAt.getTime() - now.getTime()) / 1000));
  const leftToAddMinutes = Math.max(0, maxTotalMinutes - extendedMinutes);
  const maxLabel = formatDurationMinutes({ minutes: maxTotalMinutes, t });
  const leftToAddLabel = formatDurationMinutes({ minutes: leftToAddMinutes, t });

  const optionCopies = getExtensionOptions({ options, maxTotalMinutes, extendedMinutes }).map(
    (option) => ({
      ...option,
      label: t('meetingFlow.extension.option', { count: option.minutes }),
      endsAtLabel: formatTime(addMinutes(endsAt, option.minutes)),
      resultLabel: option.isAvailable
        ? t('meetingFlow.meetingTab.optionEndsAt', {
            time: formatTime(addMinutes(endsAt, option.minutes)),
          })
        : t('meetingFlow.extension.optionUnavailable', { hours: maxTotalMinutes / 60 }),
    })
  );

  return {
    meetingName,
    scheduledStart,
    scheduledEnd,
    endsAt,
    extendedMinutes,
    maxTotalMinutes,
    leftToAddMinutes,
    formatTime,
    scheduledRangeLabel: t('meetingFlow.meetingTab.scheduledRange', {
      start: formatTime(scheduledStart),
      end: formatTime(scheduledEnd),
    }),
    endsAtLabel: formatTime(endsAt),
    maxLabel,
    leftToAddLabel,
    leftToAddValueLabel: t('meetingFlow.meetingTab.leftToAddValue', {
      left: leftToAddLabel,
      max: maxLabel,
    }),
    optionCopies,
    isAtCap: leftToAddMinutes === 0,
    isEndingSoon: secondsLeft <= 300,
    minutesLeft: Math.ceil(secondsLeft / 60),
    timerLabel: t('meetingFlow.meetingTimer.timeLeft', {
      timeLeft: t('meetingFlow.meetingTimer.minutesAndSeconds', {
        minutes: Math.floor(secondsLeft / 60),
        seconds: secondsLeft % 60,
      }),
    }),
  };
};

export default useMeetingTabCopy;
