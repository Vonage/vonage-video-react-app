import type { TFunction } from 'i18next';

/**
 * Formats whole minutes with unit labels, for example `2 h`, `1 h 40 min` or `20 min`.
 */
function formatDurationMinutes({ minutes, t }: { minutes: number; t: TFunction }): string {
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (hours === 0) return t('meetingFlow.duration.minutes', { minutes: restMinutes });
  if (restMinutes === 0) return t('meetingFlow.duration.hours', { hours });
  return t('meetingFlow.duration.hoursAndMinutes', { hours, minutes: restMinutes });
}

export default formatDurationMinutes;
