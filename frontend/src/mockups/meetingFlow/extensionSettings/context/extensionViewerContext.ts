import createContext from 'react-global-state-hooks/createContext';

/**
 * Who is looking at the extension UI and when the meeting started. The meeting numbers live in `meetingExtension$`.
 */
const extensionViewer$ = createContext(() => ({
  isSignedIn: true,
  scheduledStart: new Date(2026, 10, 2, 15, 0),
}));

export default extensionViewer$;
