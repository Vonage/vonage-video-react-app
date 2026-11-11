import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import DurationChoices from '../../components/DurationChoices';
import SettingsPrimaryButton from '../../components/SettingsPrimaryButton';
import SettingsSecondaryButton from '../../components/SettingsSecondaryButton';

export type MeetingTabDurationChooserProps = {
  initialMinutes: number | null;
  onCancel: () => void;
};

/**
 * The popup's second step, inline in the tab where the Extend button was.
 */
const MeetingTabDurationChooser = ({
  initialMinutes,
  onCancel,
}: MeetingTabDurationChooserProps): ReactElement => {
  const { t } = useTranslation();
  const [selectedMinutes, setSelectedMinutes] = useState(initialMinutes);

  return (
    <section className="flex flex-col gap-4">
      <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
        {t('meetingFlow.meetingEnding.chooseDuration')}
      </span>
      <DurationChoices selectedMinutes={selectedMinutes} onSelect={setSelectedMinutes} />
      <div className="flex gap-3">
        <SettingsSecondaryButton onClick={onCancel}>
          {t('meetingFlow.meetingEnding.cancel')}
        </SettingsSecondaryButton>
        <SettingsPrimaryButton disabled={selectedMinutes === null}>
          {t('meetingFlow.meetingEnding.confirm')}
        </SettingsPrimaryButton>
      </div>
    </section>
  );
};

export default MeetingTabDurationChooser;
