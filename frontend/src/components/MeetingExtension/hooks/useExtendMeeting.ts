import { useTranslation } from 'react-i18next';
import { notifications$, runtime$ } from '@core/stores';
import { isNil } from '@common/assertions';
import tryCatch from '@common/execution/tryCatch';
import useStableCallback from '@web/hooks/useStableCallback';
import useSessionContext from '@hooks/useSessionContext';
import { env } from '../../../env';
import frontendLogger from '../../../logger';

/**
 * Extends the meeting for everyone: applies the extended sessionKey here and sends the
 * renewal grant to the other participants over the `meeting-extended` signal.
 */
const useExtendMeeting = () => {
  const { t } = useTranslation();
  const videoClient = runtime$.useVideoClient();
  const { sessionKey, vonageVideoClient, applyExtendedCredential } = useSessionContext();

  return useStableCallback(async (minutes: number): Promise<void> => {
    if (isNil(sessionKey)) return;

    const { result: extendedSession, error } = await tryCatch(async () =>
      videoClient.extendSession({ sessionKey, minutes })
    );

    if (isNil(extendedSession)) {
      frontendLogger.reportError(error, { eventSource: 'meetingExtension.extendSession.error' });
      notifications$.actions.push({
        type: 'warning',
        message: t('meetingExtension.extendFailed'),
        expirationMs: env.NOTIFICATION_DURATION_MS,
      });
      return;
    }

    applyExtendedCredential({
      sessionKey: extendedSession.sessionKey,
      token: extendedSession.token,
    });

    if (isNil(vonageVideoClient)) return;

    const { error: signalError } = await tryCatch(() =>
      vonageVideoClient.signal({
        type: 'meeting-extended',
        data: JSON.stringify({ grant: extendedSession.grant }),
        retryAfterReconnect: true,
      })
    );

    if (isNil(signalError)) return;

    frontendLogger.reportError(signalError, { eventSource: 'meetingExtension.signal.error' });
  });
};

export default useExtendMeeting;
