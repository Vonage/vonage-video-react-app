import tryCatch from '@common/execution/tryCatch';
import type { SessionStorage } from '../../../storage/sessionStorage';
import type { VideoClient } from '../video';
import { TRANSCRIPTION_ARCHIVE_TAG } from '../constants/startArchive';

type RestartArchivingAfterServerRotationArgs = {
  sessionId: string;
  archiveName: string | undefined;
  sessionService: SessionStorage;
  videoClient: VideoClient;
};

/**
 * Restarts archiving when an archive was stopped by a server rotation (session migration).
 *
 * The `/hooks/session` event carries `reason: 'serverRotation'` and arrives first, flagging the
 * session. The `/hooks/archive` `stopped` event does not carry a reason, so that flag is the only
 * signal available. Restarting from the backend keeps a single restart per session regardless of
 * how many participants are connected.
 *
 * Uses the archive `name` field to restart with correct options (recording vs transcription).
 *
 * @param {RestartArchivingAfterServerRotationArgs} args - The session, archive name, storage and video client.
 * @returns {Promise<void>} Resolves once the restart has been attempted, or immediately when not needed.
 */
async function restartArchivingAfterServerRotation({
  sessionId,
  archiveName,
  sessionService,
  videoClient,
}: RestartArchivingAfterServerRotationArgs): Promise<void> {
  const pendingCount = await sessionService.getServerRotationPending({ sessionId });

  if (pendingCount <= 0) return;

  const sessionKey = await sessionService.getSessionKeyBySessionId({ sessionId });

  if (!sessionKey) {
    await sessionService.setServerRotationPending({ sessionId, pending: 0 });
    return;
  }

  const withTranscription = archiveName === TRANSCRIPTION_ARCHIVE_TAG;

  const { error } = await tryCatch(() =>
    videoClient.startArchive({ sessionKey, withTranscription })
  );

  if (error) {
    console.error('[Error] Failed to restart archiving after server rotation', {
      sessionId,
      archiveName,
      withTranscription,
      error,
    });
  }

  const remaining = pendingCount - 1;
  await sessionService.setServerRotationPending({ sessionId, pending: remaining });
}

export default restartArchivingAfterServerRotation;
