import createContext from 'react-global-state-hooks/createContext';
import type { ExtensionHistoryEntry } from '../types/ExtensionHistoryEntry';

/**
 * Who is looking at the extension UI and what has happened so far. The meeting numbers live in `meetingExtension$`.
 */
const extensionViewer$ = createContext(() => ({
  isSignedIn: true,
  scheduledStart: new Date(2026, 10, 2, 15, 0),
  history: [] as ExtensionHistoryEntry[],
  hasJustExtended: false,
}));

export default extensionViewer$;
