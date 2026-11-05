import type { PropsWithChildren, ReactElement } from 'react';
import meetingExtension$ from '../../extension/context/meetingExtensionContext';
import extensionViewer$ from '../context/extensionViewerContext';
import sampleMeetingTabStates, { type SampleMeetingTabStateKey } from './sampleMeetingTabStates';

/**
 * Puts "weekly-sync" (3:00–4:00 PM) and the viewer into one of the sample states.
 */
const WithMeetingTabState = ({
  stateKey,
  children,
}: PropsWithChildren<{ stateKey: SampleMeetingTabStateKey }>): ReactElement => {
  const { meeting, viewer } = sampleMeetingTabStates[stateKey];

  return (
    <meetingExtension$.Provider
      value={(state) => ({
        ...state,
        ...meeting,
        meetingName: 'weekly-sync',
        scheduledEnd: new Date(2026, 10, 2, 16, 0),
        isOpen: false,
      })}
    >
      <extensionViewer$.Provider value={(state) => ({ ...state, ...viewer })}>
        {children}
      </extensionViewer$.Provider>
    </meetingExtension$.Provider>
  );
};

export default WithMeetingTabState;
