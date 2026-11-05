import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
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
      <DialogTitle id="meeting-ending-dialog-title">
        {t('meetingExtension.chooseDuration')}
      </DialogTitle>
      <DialogContent>
        <ExtendDurationChoices
          options={options}
          selectedMinutes={selectedMinutes}
          onSelect={selectMinutes}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t('button.cancel')}</Button>
        <Button
          variant="contained"
          disabled={isConfirmDisabled}
          className="disabled:bg-vera-disabled! disabled:text-vera-text-disabled! disabled:border-vera-disabled!"
          onClick={() => void confirm()}
        >
          {t('meetingExtension.confirm')}
        </Button>
      </DialogActions>
    </>
  );
};

export default MeetingEndingDurationStep;
