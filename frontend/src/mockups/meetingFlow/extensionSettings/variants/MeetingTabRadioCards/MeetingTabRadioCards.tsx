import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import Notice from '../../../components/Notice';
import SettingsPrimaryButton from '../../components/SettingsPrimaryButton';
import extensionViewer$ from '../../context/extensionViewerContext';
import useMeetingTabCopy from '../../hooks/useMeetingTabCopy';
import useMeetingTabNotice from '../../hooks/useMeetingTabNotice';
import ExtensionHistoryList from './components/ExtensionHistoryList';

/**
 * Meeting tab variant C: one radio card per option with the end time it leads to, then the extension history.
 */
const MeetingTabRadioCards = (): ReactElement => {
  const { t } = useTranslation();
  const isSignedIn = extensionViewer$.use.select((state) => state.isSignedIn);
  const notice = useMeetingTabNotice();
  const { endsAtLabel, leftToAddLabel, optionCopies, isAtCap } = useMeetingTabCopy();
  const firstAvailable = optionCopies.find(({ isAvailable }) => isAvailable) ?? null;
  const [selectedMinutes, setSelectedMinutes] = useState(
    isSignedIn ? (firstAvailable?.minutes ?? null) : null
  );

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-text-secondary">
        {t('meetingFlow.meetingTab.tab')}
      </h2>

      {notice && <Notice tone={notice.tone}>{notice.message}</Notice>}

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="font-vera-plain text-vera-body-extended-semibold tabular-nums text-vera-text-secondary">
            {t('meetingFlow.meetingTab.endsAtTime', { time: endsAtLabel })}
          </span>
          <p className="font-vera-plain text-vera-body-base text-vera-text-tertiary">
            {t('meetingFlow.meetingTab.leftToAddSentence', { left: leftToAddLabel })}
          </p>
        </div>
        <div role="radiogroup" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {optionCopies.map(({ minutes, label, resultLabel, isAvailable }) => {
            const isSelected = minutes === selectedMinutes && !isAtCap;
            const isDisabled = !isAvailable || !isSignedIn;

            return (
              <label
                key={minutes}
                className={classNames(
                  'flex items-start gap-3 rounded-vera-medium border p-3 transition-colors',
                  {
                    'cursor-pointer border-vera-primary bg-vera-background': isSelected,
                    'cursor-pointer border-vera-border hover:border-vera-primary':
                      !isSelected && !isDisabled,
                    'cursor-not-allowed border-vera-border opacity-50': isDisabled,
                  }
                )}
              >
                <input
                  type="radio"
                  name="mockup-meeting-tab-option"
                  className="mt-1 accent-vera-primary"
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => setSelectedMinutes(minutes)}
                />
                <span className="flex flex-col">
                  <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
                    {label}
                  </span>
                  <span className="font-vera-plain text-vera-caption tabular-nums text-vera-text-tertiary">
                    {resultLabel}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        {isSignedIn && (
          <SettingsPrimaryButton disabled={isAtCap}>
            {t('meetingFlow.extension.extend')}
          </SettingsPrimaryButton>
        )}
      </section>

      <div className="border-t border-vera-border pt-6">
        <ExtensionHistoryList />
      </div>
    </div>
  );
};

export default MeetingTabRadioCards;
