import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { isNotNil } from '@common/assertions';
import type { ScheduleWindow } from '@common/types';
import { useMeetingExtension } from '@components/MeetingExtension';
import isSignedIn from '@utils/isSignedIn';
import MeetingProgress from './components/MeetingProgress';
import MeetingTabButton from './components/MeetingTabButton';
import MeetingTabDurationChooser from './components/MeetingTabDurationChooser';

export type AdvancedSettingsMeetingTabProps = {
  scheduleWindow: ScheduleWindow;
};

const mutedLineClassName = 'font-vera-plain text-vera-caption text-vera-text-tertiary';

const AdvancedSettingsMeetingTab = ({
  scheduleWindow,
}: AdvancedSettingsMeetingTabProps): ReactElement => {
  const { t } = useTranslation();
  const extension = useMeetingExtension();
  const [isChoosingDuration, setIsChoosingDuration] = useState(false);

  const extendArea = (() => {
    if (!isSignedIn()) {
      return <p className={mutedLineClassName}>{t('meetingExtension.signInToExtend')}</p>;
    }
    if (extension?.isAtLimit) {
      return <p className={mutedLineClassName}>{t('meetingExtension.cannotExtend')}</p>;
    }
    if (isChoosingDuration && isNotNil(extension)) {
      return (
        <MeetingTabDurationChooser
          options={extension.options}
          onCancel={() => setIsChoosingDuration(false)}
        />
      );
    }
    return (
      <MeetingTabButton onClick={() => setIsChoosingDuration(true)}>
        {t('meetingExtension.extend')}
      </MeetingTabButton>
    );
  })();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-text-secondary">
        {t('meetingExtension.ongoingMeeting')}
      </h2>
      <MeetingProgress scheduleWindow={scheduleWindow} />
      {extendArea}
    </div>
  );
};

export default AdvancedSettingsMeetingTab;
