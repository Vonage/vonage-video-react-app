import { useTranslation } from 'react-i18next';
import formatCountdown from '../../helpers/formatCountdown';
import formatMeetingDate from '../../helpers/formatMeetingDate';
import getExtensionOptions, { type ExtensionOption } from '../../helpers/getExtensionOptions';
import useLocale from '../../hooks/useLocale';
import meetingExtension$ from '../context/meetingExtensionContext';

export type ExtensionOptionCopy = ExtensionOption & {
  label: string;
  resultLabel: string;
};

const useExtensionState = meetingExtension$.use.createSelectorHook(
  ({ scheduledEnd, extendedMinutes, maxTotalMinutes, options, now }) => ({
    scheduledEnd,
    extendedMinutes,
    maxTotalMinutes,
    options,
    now,
  })
);

/**
 * Derived numbers and words for the extension UI: time left, new end per option, and the cap.
 */
const useExtensionCopy = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { scheduledEnd, extendedMinutes, maxTotalMinutes, options, now } = useExtensionState();

  const endsAt = new Date(scheduledEnd.getTime() + extendedMinutes * 60_000);
  const secondsLeft = Math.max(0, Math.round((endsAt.getTime() - now.getTime()) / 1000));
  const formatTime = (date: Date) => formatMeetingDate({ date, locale, format: 'time' });
  const maxHours = maxTotalMinutes / 60;
  const isAtCap = extendedMinutes >= maxTotalMinutes;

  const countdown = (() => {
    if (secondsLeft < 600) return formatCountdown(secondsLeft);
    return t('meetingFlow.common.minutes', { count: Math.round(secondsLeft / 60) });
  })();

  const optionCopies: ExtensionOptionCopy[] = getExtensionOptions({
    options,
    maxTotalMinutes,
    extendedMinutes,
  }).map((option) => ({
    ...option,
    label: t('meetingFlow.extension.option', { count: option.minutes }),
    resultLabel: option.isAvailable
      ? t('meetingFlow.extension.optionEndsAt', {
          time: formatTime(new Date(endsAt.getTime() + option.minutes * 60_000)),
        })
      : t('meetingFlow.extension.optionUnavailable', { hours: maxHours }),
  }));

  return {
    countdown,
    endsAtLabel: formatTime(endsAt),
    optionCopies,
    isAtCap,
    usedLabel: t('meetingFlow.extension.used', { used: extendedMinutes, max: maxTotalMinutes }),
    atCapLabel: t('meetingFlow.extension.atCap', { hours: maxHours }),
    hasExtensions: extendedMinutes > 0,
    isEndingSoon: secondsLeft <= 300,
  };
};

export default useExtensionCopy;
