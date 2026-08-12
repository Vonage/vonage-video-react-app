import tryCatch from '@common/execution/tryCatch';
import type { SessionStorage } from '../../../storage/sessionStorage';
import type { VideoClient } from '../video';

type RestartArchivingAfterServerRotationArgs = {
  sessionId: string;
  sessionService: SessionStorage;
  makeVideoClient: () => VideoClient;
};

/**
 * Restarts archiving when an archive was stopped by a server rotation (session migration).
 *
 * The `/hooks/session` event carries `reason: 'serverRotation'` and arrives first, flagging the
 * session. The `/hooks/archive` `stopped` event does not carry a reason, so that flag is the only
 * signal available. Restarting from the backend keeps a single restart per session regardless of
 * how many participants are connected.
 * @param {RestartArchivingAfterServerRotationArgs} args - The session, its storage and the video client factory.
 * @returns {Promise<void>} Resolves once the restart has been attempted, or immediately when not needed.
 */
async function restartArchivingAfterServerRotation({
  sessionId,
  sessionService,
  makeVideoClient,
}: RestartArchivingAfterServerRotationArgs): Promise<void> {
  const isServerRotation = await sessionService.getServerRotationPending({ sessionId });

  if (!isServerRotation) return;

  await sessionService.setServerRotationPending({ sessionId, pending: false });

  const sessionKey = await sessionService.getSessionKeyBySessionId({ sessionId });

  if (!sessionKey) return;

  const videoClient = makeVideoClient();

  // A failed restart must not reject: the webhook handler reports errors by throwing, and an
  // async throw surfaces as an unhandled rejection that would terminate the process.
  const { error } = await tryCatch(() => videoClient.startArchive({ sessionKey }));

  if (error) {
    console.error('[Error] Failed to restart archiving after server rotation', {
      sessionId,
      error,
    });
  }
}

export default restartArchivingAfterServerRotation;
