import { useEffect, useRef, useState, type ReactElement } from 'react';
import { isNotNil } from '@common/assertions';
import { useMeetingExtension } from '@components/MeetingExtension';
import MeetingEndingDurationStep from './components/MeetingEndingDurationStep';
import MeetingEndingNoticeStep from './components/MeetingEndingNoticeStep';

type MeetingEndingStep = 'notice' | 'chooseDuration' | 'closed';

/**
 * Tells a signed-in participant that the meeting is about to end, with a second step to extend it.
 */
const MeetingEndingDialog = (): ReactElement => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const extension = useMeetingExtension();
  const [step, setStep] = useState<MeetingEndingStep>('notice');
  const isAtLimit = extension?.isAtLimit ?? false;
  const close = () => setStep('closed');
  const isOpen = step !== 'closed';

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;

    const previousFocus = document.activeElement;
    dialog.showModal();

    return () => {
      dialog.close();
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={close}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="m-auto max-h-[calc(100%-4rem)] w-[calc(100%-4rem)] max-w-111 overflow-y-auto rounded-vera-small border-0 bg-vera-surface p-0 font-vera-plain text-left text-vera-text-secondary shadow-xl backdrop:bg-black/50 dark:border dark:border-vera-border"
      aria-labelledby="meeting-ending-dialog-title"
    >
      <div>
        {step === 'chooseDuration' && isNotNil(extension) && !isAtLimit ? (
          <MeetingEndingDurationStep
            options={extension.options}
            onCancel={() => setStep('notice')}
          />
        ) : (
          <MeetingEndingNoticeStep
            isAtLimit={isAtLimit}
            onGotIt={close}
            onExtend={() => setStep('chooseDuration')}
          />
        )}
      </div>
    </dialog>
  );
};

export default MeetingEndingDialog;
