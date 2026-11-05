import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Notice from '../../../components/Notice';
import SegmentedTab from '../../../components/SegmentedTab';
import SettingsPrimaryButton from '../../components/SettingsPrimaryButton';
import extensionViewer$ from '../../context/extensionViewerContext';
import useMeetingTabCopy from '../../hooks/useMeetingTabCopy';
import useMeetingTabNotice from '../../hooks/useMeetingTabNotice';
import ExtensionTimeline from './components/ExtensionTimeline';
import ExtensionTimelineLegend from './components/ExtensionTimelineLegend';

/**
 * Meeting tab variant B: the scheduled time and every extension on one bar, with the 2 h cap at its end.
 */
const MeetingTabTimeline = (): ReactElement => {
  const { t } = useTranslation();
  const isSignedIn = extensionViewer$.use.select((state) => state.isSignedIn);
  const notice = useMeetingTabNotice();
  const { endsAtLabel, scheduledRangeLabel, leftToAddLabel, optionCopies, isAtCap } =
    useMeetingTabCopy();
  const firstAvailable = optionCopies.find(({ isAvailable }) => isAvailable) ?? null;
  const [selectedMinutes, setSelectedMinutes] = useState(firstAvailable?.minutes ?? null);
  const selectedOption = optionCopies.find(({ minutes }) => minutes === selectedMinutes) ?? null;
  const previewMinutes = isSignedIn && selectedOption ? selectedOption.minutes : 0;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-text-secondary">
        {t('meetingFlow.meetingTab.tab')}
      </h2>

      {notice && <Notice tone={notice.tone}>{notice.message}</Notice>}

      <div className="flex flex-col gap-1">
        <span className="font-vera-plain text-vera-heading-4 tabular-nums text-vera-text-secondary">
          {t('meetingFlow.meetingTab.endsAtTime', { time: endsAtLabel })}
        </span>
        <span className="font-vera-plain text-vera-body-base text-vera-text-tertiary">
          {t('meetingFlow.meetingTab.scheduled')} {scheduledRangeLabel} ·{' '}
          {t('meetingFlow.meetingTab.leftToAddSentence', { left: leftToAddLabel })}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <ExtensionTimeline previewMinutes={previewMinutes} />
        <ExtensionTimelineLegend />
      </div>

      {isSignedIn && (
        <section className="flex flex-col gap-4 border-t border-vera-border pt-6">
          <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
            {t('meetingFlow.meetingTab.extendBy')}
          </span>
          <div role="tablist" className="flex gap-1 rounded-xl bg-vera-background p-1">
            {optionCopies.map(({ minutes, label, isAvailable }) => (
              <SegmentedTab
                key={minutes}
                isSelected={!isAtCap && minutes === selectedMinutes}
                disabled={!isAvailable}
                className="disabled:cursor-not-allowed disabled:text-vera-text-disabled disabled:hover:bg-transparent"
                onClick={() => setSelectedMinutes(minutes)}
              >
                {label}
              </SegmentedTab>
            ))}
          </div>
          <SettingsPrimaryButton disabled={isAtCap}>
            {selectedOption && !isAtCap
              ? t('meetingFlow.meetingTab.extendTo', { time: selectedOption.endsAtLabel })
              : t('meetingFlow.extension.extendMeeting')}
          </SettingsPrimaryButton>
        </section>
      )}
    </div>
  );
};

export default MeetingTabTimeline;
