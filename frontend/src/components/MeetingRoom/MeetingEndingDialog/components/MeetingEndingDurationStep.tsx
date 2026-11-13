import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ExtendDurationChoices,
  useExtendDurationChoice,
  type ExtensionOption,
} from '@components/MeetingExtension';

export type MeetingEndingDurationStepProps = {
  options: ExtensionOption[];
  onCancel: () => void;
};

const MeetingEndingDurationStep = ({
  options,
  onCancel,
}: MeetingEndingDurationStepProps): ReactElement => {
  const { t } = useTranslation();
  const { selectedMinutes, selectMinutes, isConfirmDisabled, confirm } = useExtendDurationChoice();

  return (
    <>
      <h2
        id="meeting-ending-dialog-title"
        className="px-6 py-4 text-vera-heading-4 text-vera-text-secondary"
      >
        {t('meetingExtension.chooseDuration')}
      </h2>
      <div className="px-6 pb-5">
        <ExtendDurationChoices
          options={options}
          selectedMinutes={selectedMinutes}
          onSelect={selectMinutes}
        />
      </div>
      <div className="flex justify-end gap-2 p-2">
        <button
          type="button"
          className="cursor-pointer rounded-vera-small px-2 py-1.5 text-vera-body-base-semibold text-vera-primary hover:bg-vera-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vera-primary"
          onClick={onCancel}
        >
          {t('button.cancel')}
        </button>
        <button
          type="button"
          disabled={isConfirmDisabled}
          className="cursor-pointer rounded-vera-small bg-vera-primary px-4 py-1.5 text-vera-body-base-semibold text-vera-on-primary hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vera-primary disabled:cursor-not-allowed disabled:bg-vera-disabled disabled:text-vera-text-disabled disabled:hover:opacity-100"
          onClick={() => void confirm()}
        >
          {t('meetingExtension.confirm')}
        </button>
      </div>
    </>
  );
};

export default MeetingEndingDurationStep;
