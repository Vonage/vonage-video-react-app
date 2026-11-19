import createContext from 'react-global-state-hooks/createContext';
import type { SavedMeetingId } from '../../../types/SavedMeetingId';

/**
 * Meetings picked for export in the archive drawer, and whether the export warning was acknowledged.
 */
const archiveSelection$ = createContext(
  () => ({
    selectedIds: [] as SavedMeetingId[],
    isWarningAcknowledged: false,
  }),
  {
    actions: {
      toggle(id: SavedMeetingId) {
        return ({ setState }) => {
          setState((state) => {
            const isSelected = state.selectedIds.includes(id);
            const selectedIds = isSelected
              ? state.selectedIds.filter((selectedId) => selectedId !== id)
              : [...state.selectedIds, id];

            return { ...state, selectedIds };
          });
        };
      },
      setAll(ids: SavedMeetingId[]) {
        return ({ setState }) => {
          setState((state) => ({ ...state, selectedIds: ids }));
        };
      },
      setWarningAcknowledged(isWarningAcknowledged: boolean) {
        return ({ setState }) => {
          setState((state) => ({ ...state, isWarningAcknowledged }));
        };
      },
    },
  }
);

export default archiveSelection$;
