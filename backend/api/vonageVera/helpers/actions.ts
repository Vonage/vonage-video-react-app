import type { GetOrCreateSession } from '../actions/getHandler/schemas/GetOrCreateSession';
import type { StartArchive } from '../actions/getHandler/schemas/StartArchive';
import type { StopArchive } from '../actions/getHandler/schemas/StopArchive';
import type { ListArchives } from '../actions/getHandler/schemas/ListArchives';
import type { EnableCaptions } from '../actions/getHandler/schemas/EnableCaptions';
import type { DisableCaptions } from '../actions/getHandler/schemas/DisableCaptions';

export const actions = {
  getOrCreateSession: (room: string): GetOrCreateSession => ({
    action: 'getOrCreateSession',
    payload: { room },
  }),

  startArchive: (room: string): StartArchive => ({
    action: 'startArchive',
    payload: { room },
  }),

  stopArchive: (room: string, archiveId: string): StopArchive => ({
    action: 'stopArchive',
    payload: { room, archiveId },
  }),

  listArchives: (room: string): ListArchives => ({
    action: 'listArchives',
    payload: { room },
  }),

  enableCaptions: (room: string): EnableCaptions => ({
    action: 'enableCaptions',
    payload: { room },
  }),

  disableCaptions: (room: string, captionsId: string): DisableCaptions => ({
    action: 'disableCaptions',
    payload: { room, captionsId },
  }),
} as const;

export default actions;
