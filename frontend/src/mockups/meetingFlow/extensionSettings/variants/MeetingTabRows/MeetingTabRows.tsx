import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import ChoiceChip from '../../../components/ChoiceChip';
import Notice from '../../../components/Notice';
import SettingsPrimaryButton from '../../components/SettingsPrimaryButton';
import extensionViewer$ from '../../context/extensionViewerContext';
import useMeetingTabCopy from '../../hooks/useMeetingTabCopy';
import useMeetingTabNotice from '../../hooks/useMeetingTabNotice';
import SettingsInfoRow from './components/SettingsInfoRow';

/**
 * Meeting tab variant A: rows like the other Settings tabs, then choice chips and one button.
 */
const MeetingTabRows = (): ReactElement => {
  const { t } = useTranslation();
  const isSignedIn = extensionViewer$.use.select((state) => state.isSignedIn);
  const notice = useMeetingTabNotice();
  const { scheduledRangeLabel, endsAtLabel, leftToAddValueLabel, maxLabel, optionCopies, isAtCap } =
    useMeetingTabCopy();
  const firstAvailable = optionCopies.find(({ isAvailable }) => isAvailable) ?? null;
  const [selectedMinutes, setSelectedMinutes] = useState(firstAvailable?.minutes ?? null);
  const selectedOption = optionCopies.find(({ minutes }) => minutes === selectedMinutes) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-text-secondary">
        {t('meetingFlow.meetingTab.tab')}
      </h2>

      {notice && <Notice tone={notice.tone}>{notice.message}</Notice>}

      <section className="flex flex-col gap-6">
        <SettingsInfoRow
          label={t('meetingFlow.meetingTab.scheduled')}
          value={scheduledRangeLabel}
        />
        <SettingsInfoRow label={t('meetingFlow.meetingTab.endsAt')} value={endsAtLabel} />
        <SettingsInfoRow
          label={t('meetingFlow.meetingTab.leftToAdd')}
          value={leftToAddValueLabel}
          description={t('meetingFlow.meetingTab.capDescription', { max: maxLabel })}
        />
      </section>

      {isSignedIn && (
        <section className="flex flex-col gap-4 border-t border-vera-border pt-6">
          <div className="flex flex-col gap-1.5">
            <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
              {t('meetingFlow.meetingTab.extendBy')}
            </span>
            <p className="font-vera-plain text-vera-body-base text-vera-text-tertiary">
              {t('meetingFlow.meetingTab.extendByDescription')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {optionCopies.map(({ minutes, label, resultLabel, isAvailable }) => (
              <div key={minutes} className="flex flex-col items-center gap-1">
                <ChoiceChip
                  isSelected={!isAtCap && minutes === selectedMinutes}
                  disabled={!isAvailable}
                  onClick={() => setSelectedMinutes(minutes)}
                >
                  {label}
                </ChoiceChip>
                <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
                  {resultLabel}
                </span>
              </div>
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

export default MeetingTabRows;
