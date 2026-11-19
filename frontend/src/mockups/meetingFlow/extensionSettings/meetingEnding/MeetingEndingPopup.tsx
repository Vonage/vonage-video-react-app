import { useState, type ReactElement } from 'react';
import Dialog from '@mui/material/Dialog';
import useMeetingTabCopy from '../hooks/useMeetingTabCopy';
import MeetingEndingDurationStep from './components/MeetingEndingDurationStep';
import MeetingEndingNoticeStep from './components/MeetingEndingNoticeStep';

export type MeetingEndingStep = 'notice' | 'chooseDuration';

export type MeetingEndingPopupProps = {
  initialStep: MeetingEndingStep;
  initialMinutes: number | null;
};

/**
 * The signed-in popup at the start of the last five minutes, in the meeting room's PopupDialog look.
 * "Extend" turns it into a second step that asks for the duration.
 */
const MeetingEndingPopup = ({
  initialStep,
  initialMinutes,
}: MeetingEndingPopupProps): ReactElement => {
  const { isAtCap } = useMeetingTabCopy();
  const [step, setStep] = useState(initialStep);
  const isChoosingDuration = step === 'chooseDuration' && !isAtCap;

  return (
    <Dialog open maxWidth="xs" fullWidth aria-labelledby="mockup-meeting-ending-title">
      {isChoosingDuration ? (
        <MeetingEndingDurationStep
          initialMinutes={initialMinutes}
          onCancel={() => setStep('notice')}
        />
      ) : (
        <MeetingEndingNoticeStep onExtend={() => setStep('chooseDuration')} />
      )}
    </Dialog>
  );
};

export default MeetingEndingPopup;
