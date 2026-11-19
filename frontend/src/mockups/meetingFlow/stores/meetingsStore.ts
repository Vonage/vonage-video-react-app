import createGlobalState from 'react-global-state-hooks/createGlobalState';
import sampleMeetings from '../sampleData/sampleMeetings';
import type { SavedMeetingId } from '../types/SavedMeetingId';

/**
 * Saved meetings list. The real feature reads it from IndexedDB through `useMeetings`; the mockups seed it with sample data.
 */
const meetings$ = createGlobalState(sampleMeetings, {
  name: 'meetingFlowMockupMeetings',
  actions: {
    archive(id: SavedMeetingId) {
      return ({ setState }) => {
        setState((meetings) =>
          meetings.map((meeting) =>
            meeting.id === id ? { ...meeting, isArchived: true } : meeting
          )
        );
      };
    },
    restore(id: SavedMeetingId) {
      return ({ setState }) => {
        setState((meetings) =>
          meetings.map((meeting) =>
            meeting.id === id ? { ...meeting, isArchived: false } : meeting
          )
        );
      };
    },
  },
});

export const useUpcomingMeetings = meetings$.createSelectorHook((meetings) =>
  meetings.filter(({ isArchived }) => !isArchived)
);

export const useArchivedMeetings = meetings$.createSelectorHook((meetings) =>
  meetings.filter(({ isArchived }) => isArchived)
);

export default meetings$;
