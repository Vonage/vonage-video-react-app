import type { TFunction } from 'i18next';

/**
 * "45 min", "1 hour", "90 min", "2 hours": whole hours read as hours, anything else as minutes.
 */
function getDurationLabel({ minutes, t }: { minutes: number; t: TFunction }): string {
  const isWholeHours = minutes % 60 === 0;

  if (isWholeHours) return t('meetingFlow.wizard.details.duration.hours', { count: minutes / 60 });
  return t('meetingFlow.wizard.details.duration.option', { count: minutes });
}

export default getDurationLabel;
