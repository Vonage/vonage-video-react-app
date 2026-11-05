import { useState, type ReactElement } from 'react';
import Dialog from '@mui/material/Dialog';
import { isNotNil } from '@common/assertions';
import { useMeetingExtension } from '@components/MeetingExtension';
import MeetingEndingDurationStep from './components/MeetingEndingDurationStep';
import MeetingEndingNoticeStep from './components/MeetingEndingNoticeStep';

type MeetingEndingStep = 'notice' | 'chooseDuration' | 'closed';

/**
 * Tells a signed-in participant that the meeting is about to end, with a second step to extend it.
 */
const MeetingEndingDialog = (): ReactElement => {
  const extension = useMeetingExtension();
  const [step, setStep] = useState<MeetingEndingStep>('notice');
  const isAtLimit = extension?.isAtLimit ?? false;
  const close = () => setStep('closed');

  return (
    <Dialog
      open={step !== 'closed'}
      onClose={close}
      maxWidth="xs"
      fullWidth
      aria-labelledby="meeting-ending-dialog-title"
    >
      {step === 'chooseDuration' && isNotNil(extension) && !isAtLimit ? (
        <MeetingEndingDurationStep options={extension.options} onCancel={() => setStep('notice')} />
      ) : (
        <MeetingEndingNoticeStep
          isAtLimit={isAtLimit}
          onGotIt={close}
          onExtend={() => setStep('chooseDuration')}
        />
      )}
    </Dialog>
  );
};

export default MeetingEndingDialog;
