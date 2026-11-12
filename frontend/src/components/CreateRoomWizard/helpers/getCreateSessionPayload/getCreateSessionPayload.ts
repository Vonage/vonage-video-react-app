import type { MeetingDraft } from '../../types/MeetingDraft';
import getMeetingStartsAt from '../getMeetingStartsAt';

type UnscheduledSessionPayload = {
  roomName: string;
};

type ScheduledSessionPayload = UnscheduledSessionPayload & {
  schedule: { startsAt: number; durationMinutes: number };
};

export type CreateMeetingSessionPayload = UnscheduledSessionPayload | ScheduledSessionPayload;

/**
 * Maps the wizard draft to the `createSession` input. An empty name falls back to `fallbackRoomName`.
 */
function getCreateSessionPayload({
  draft,
  fallbackRoomName,
}: {
  draft: MeetingDraft;
  fallbackRoomName: string;
}): CreateMeetingSessionPayload {
  const roomName = draft.name || fallbackRoomName;

  if (!draft.isScheduled) return { roomName };

  return {
    roomName,
    schedule: {
      startsAt: getMeetingStartsAt(draft),
      durationMinutes: draft.durationMinutes,
    },
  };
}

export default getCreateSessionPayload;
