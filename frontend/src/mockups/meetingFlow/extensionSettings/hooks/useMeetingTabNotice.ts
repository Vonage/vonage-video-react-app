import { useTranslation } from 'react-i18next';
import type { NoticeProps } from '../../components/Notice';
import extensionViewer$ from '../context/extensionViewerContext';
import useMeetingTabCopy from './useMeetingTabCopy';

export type MeetingTabNotice = {
  tone: NoticeProps['tone'];
  message: string;
};

const useViewerFlags = extensionViewer$.use.createSelectorHook(
  ({ isSignedIn, hasJustExtended, history }) => ({
    isSignedIn,
    hasJustExtended,
    lastExtensionMinutes: history.at(-1)?.minutes ?? 0,
  })
);

/**
 * The one message the Meeting tab shows for the current state, or null when there is nothing to say.
 */
const useMeetingTabNotice = (): MeetingTabNotice | null => {
  const { t } = useTranslation();
  const { isSignedIn, hasJustExtended, lastExtensionMinutes } = useViewerFlags();
  const { isAtCap, maxLabel, endsAtLabel } = useMeetingTabCopy();

  if (!isSignedIn) return { tone: 'information', message: t('meetingFlow.meetingTab.signIn') };
  if (hasJustExtended) {
    return {
      tone: 'success',
      message: t('meetingFlow.meetingTab.extended', {
        count: lastExtensionMinutes,
        time: endsAtLabel,
      }),
    };
  }
  if (isAtCap) {
    return {
      tone: 'information',
      message: t('meetingFlow.meetingTab.atCap', { max: maxLabel, time: endsAtLabel }),
    };
  }
  return null;
};

export default useMeetingTabNotice;
