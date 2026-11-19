import { useTranslation } from 'react-i18next';
import throttle from '@common/execution/throttle';
import useStableCallback from '@web/hooks/useStableCallback';
import useStableRef from '@web/hooks/useStableRef';
import { notifications$ } from '@core/stores';
import frontendLogger from '../../../logger';

export const CONNECTION_ISSUES_NOTIFICATION_MS = 6_000;

const useResubscribeFailureNotifier = () => {
  const { t } = useTranslation();

  const { current: notifyConnectionIssues } = useStableRef(() => {
    return throttle(
      () => {
        notifications$.actions.push({
          type: 'warning',
          message: t('subscribingErrors.resubscribeFailed.message'),
          expirationMs: CONNECTION_ISSUES_NOTIFICATION_MS,
        });
      },
      CONNECTION_ISSUES_NOTIFICATION_MS,
      { leading: true, trailing: false }
    );
  }, []);

  const resubscribeFailureNotifier = useStableCallback(
    ({ streamId, error }: { streamId: string; error: unknown }) => {
      frontendLogger.reportError(error, { eventSource: 'session.resubscribeFailed', streamId });
      notifyConnectionIssues();
    }
  );

  return { resubscribeFailureNotifier };
};

export default useResubscribeFailureNotifier;
