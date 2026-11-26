import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import SettingsPrimaryButton from '../components/SettingsPrimaryButton';
import extensionViewer$ from '../context/extensionViewerContext';
import useMeetingTabCopy from '../hooks/useMeetingTabCopy';
import MeetingProgress from './components/MeetingProgress';
import MeetingTabDurationChooser from './components/MeetingTabDurationChooser';

export type MeetingTabStep = 'overview' | 'chooseDuration';

export type MeetingTabProps = {
  initialStep: MeetingTabStep;
  initialMinutes: number | null;
};

/**
 * Settings > Meeting: how far the meeting has run, and Extend for signed-in people below the 2 h cap.
 */
const MeetingTab = ({ initialStep, initialMinutes }: MeetingTabProps): ReactElement => {
  const { t } = useTranslation();
  const isSignedIn = extensionViewer$.use.select((state) => state.isSignedIn);
  const { isAtCap } = useMeetingTabCopy();
  const [step, setStep] = useState(initialStep);

  const extendArea = (() => {
    if (!isSignedIn) return <MutedLine>{t('meetingFlow.meetingTab.signIn')}</MutedLine>;
    if (isAtCap) return <MutedLine>{t('meetingFlow.meetingEnding.cannotExtend')}</MutedLine>;
    if (step === 'chooseDuration') {
      return (
        <MeetingTabDurationChooser
          initialMinutes={initialMinutes}
          onCancel={() => setStep('overview')}
        />
      );
    }
    return (
      <SettingsPrimaryButton onClick={() => setStep('chooseDuration')}>
        {t('meetingFlow.meetingEnding.extend')}
      </SettingsPrimaryButton>
    );
  })();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-text-secondary">
        {t('meetingFlow.meetingTab.title')}
      </h2>
      <MeetingProgress />
      {extendArea}
    </div>
  );
};

function MutedLine({ children }: { children: string }): ReactElement {
  return <p className="font-vera-plain text-vera-caption text-vera-text-tertiary">{children}</p>;
}

export default MeetingTab;
