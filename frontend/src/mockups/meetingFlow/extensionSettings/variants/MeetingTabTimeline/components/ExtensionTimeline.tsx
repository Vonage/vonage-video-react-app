import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import VividIcon from '@ui/components/VividIcon';
import meetingExtension$ from '../../../../extension/context/meetingExtensionContext';
import useMeetingTabCopy from '../../../hooks/useMeetingTabCopy';

export type ExtensionTimelineProps = {
  previewMinutes: number;
};

/**
 * A bar from the scheduled start to the latest possible end: scheduled time, extensions, the chosen option and the cap.
 */
const ExtensionTimeline = ({ previewMinutes }: ExtensionTimelineProps): ReactElement => {
  const { t } = useTranslation();
  const now = meetingExtension$.use.select((state) => state.now);
  const { scheduledStart, scheduledEnd, extendedMinutes, maxTotalMinutes, maxLabel, formatTime } =
    useMeetingTabCopy();

  const scheduledMinutes = (scheduledEnd.getTime() - scheduledStart.getTime()) / 60_000;
  const totalMinutes = scheduledMinutes + maxTotalMinutes;
  const percentOf = (minutes: number) => `${(minutes / totalMinutes) * 100}%`;
  const nowMinutes = (now.getTime() - scheduledStart.getTime()) / 60_000;
  const latestEnd = new Date(scheduledEnd.getTime() + maxTotalMinutes * 60_000);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-5">
        <span
          className="absolute -translate-x-1/2 font-vera-plain text-vera-caption-semibold text-vera-text-secondary"
          style={{ left: percentOf(nowMinutes) }}
        >
          {t('meetingFlow.meetingTab.now')}
        </span>
      </div>
      <div className="relative flex h-4 w-full overflow-hidden rounded-full border border-vera-border bg-vera-background">
        <div className="h-full bg-vera-primary" style={{ width: percentOf(scheduledMinutes) }} />
        <div className="h-full bg-vera-primary/45" style={{ width: percentOf(extendedMinutes) }} />
        {previewMinutes > 0 && (
          <div
            className="h-full border-y-2 border-r-2 border-dashed border-vera-primary bg-vera-primary/15"
            style={{ width: percentOf(previewMinutes) }}
          />
        )}
        <div
          className="absolute inset-y-0 w-0.5 bg-vera-text-secondary"
          style={{ left: percentOf(nowMinutes) }}
        />
      </div>
      <div className="relative h-5 font-vera-plain text-vera-caption tabular-nums text-vera-text-tertiary">
        <span className="absolute left-0">{formatTime(scheduledStart)}</span>
        <span className="absolute -translate-x-1/2" style={{ left: percentOf(scheduledMinutes) }}>
          {formatTime(scheduledEnd)}
        </span>
        <span className="absolute right-0 flex items-center gap-1 text-vera-text-secondary">
          <VividIcon
            name="lock-line"
            customSize={-6}
            style={{ color: 'var(--vera-text-secondary)' }}
          />
          {t('meetingFlow.meetingTab.limitMarker', { max: maxLabel })} · {formatTime(latestEnd)}
        </span>
      </div>
    </div>
  );
};

export default ExtensionTimeline;
