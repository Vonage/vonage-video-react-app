import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ExtendDurationChoices,
  useExtendDurationChoice,
  type ExtensionOption,
} from '@components/MeetingExtension';
import MeetingTabButton from './MeetingTabButton';

export type MeetingTabDurationChooserProps = {
  options: ExtensionOption[];
  onCancel: () => void;
};

const MeetingTabDurationChooser = ({
  options,
  onCancel,
}: MeetingTabDurationChooserProps): ReactElement => {
  const { t } = useTranslation();
  const { selectedMinutes, selectMinutes, isConfirmDisabled, confirm } = useExtendDurationChoice();

  return (
    <section className="flex flex-col gap-4">
      <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
        {t('meetingExtension.chooseDuration')}
      </span>
      <ExtendDurationChoices
        options={options}
        selectedMinutes={selectedMinutes}
        onSelect={selectMinutes}
      />
      <div className="flex gap-3">
        <MeetingTabButton variant="secondary" onClick={onCancel}>
          {t('button.cancel')}
        </MeetingTabButton>
        <MeetingTabButton disabled={isConfirmDisabled} onClick={() => void confirm()}>
          {t('meetingExtension.confirm')}
        </MeetingTabButton>
      </div>
    </section>
  );
};

export default MeetingTabDurationChooser;
