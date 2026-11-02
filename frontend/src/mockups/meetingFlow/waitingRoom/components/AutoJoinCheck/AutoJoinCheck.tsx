import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import SelectionCheckbox from '../../../components/SelectionCheckbox';
import meetingSchedule$ from '../../context/meetingScheduleContext';

/**
 * Opt-in auto-join, off by default and disabled until a name is entered.
 */
const AutoJoinCheck = (): ReactElement => {
  const { t } = useTranslation();
  const hasUsername = meetingSchedule$.use.select(({ username }) => username.trim() !== '');
  const isAutoJoinEnabled = meetingSchedule$.use.select((state) => state.isAutoJoinEnabled);
  const { setAutoJoinEnabled } = meetingSchedule$.use.actions();

  return (
    <div className="flex flex-col gap-0.5">
      <label
        className={classNames('flex items-center gap-2 font-vera-plain text-vera-body-base', {
          'cursor-pointer text-vera-text-secondary': hasUsername,
          'cursor-not-allowed text-vera-text-disabled': !hasUsername,
        })}
      >
        <SelectionCheckbox
          disabled={!hasUsername}
          checked={hasUsername && isAutoJoinEnabled}
          onChange={(event) => setAutoJoinEnabled(event.currentTarget.checked)}
        />
        {t('meetingFlow.waitingRoom.autoJoin')}
      </label>
      {!hasUsername && (
        <span className="pl-6 font-vera-plain text-vera-caption text-vera-text-tertiary">
          {t('meetingFlow.waitingRoom.autoJoinHint')}
        </span>
      )}
    </div>
  );
};

export default AutoJoinCheck;
