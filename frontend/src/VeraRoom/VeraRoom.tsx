import { useMemo, useRef, type ComponentProps, type FC } from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AppContextProvider from '../AppContextProvider';
import RoomProvider from '@Context/RoomProvider';
import bridge$ from './stores/bridge';
import WaitingRoomStage from './stages/WaitingRoomStage';
import MeetingRoomStage from './stages/MeetingRoomStage';
import GoodByeStage from './stages/GoodByeStage';
import useStateSynchronizer from './hooks/useStateSynchronizer';
import { useMountEffect } from '@web/hooks';

type BridgeProps = {
  /** Identifier passed in from the `entry-point` HTML attribute. */
  entryPoint?: string;
  /**
   * Room name to join, passed in from the `session-identifier` HTML attribute.
   * If provided, the initial view will be the waiting room for that room.
   */
  sessionIdentifier?: string;
  /**
   * BCP-47 language tag passed in from the `language` HTML attribute.
   * Overrides the browser's detected language.
   * Example: 'es', 'it', 'en'
   */
  language?: string;
};

type VeraRoomProps = ComponentProps<'div'> & BridgeProps;

/**
 * VeraRoom
 *
 * Root React component for the <vera-room> custom element.
 * Manages the 3-stage embed flow (waiting room → meeting room → goodbye)
 * through a MemoryRouter so navigation is fully isolated from the host page.
 *
 * Props are supplied by VeraRoomElement on every attribute change; React
 * reconciliation ensures that only what changed actually re-renders.
 */
const VeraRoom: FC<VeraRoomProps> = ({ className, ...props }) => {
  useStateSynchronizer();

  const container = useMemo(() => {
    return globalThis.document.createElement('div');
  }, []);

  const mainContainer = useRef<HTMLDivElement>(null);

  const sessionIdentifier = bridge$.use.select((state) => state.sessionIdentifier);
  const initialEntry = sessionIdentifier ? `/waiting-room/${sessionIdentifier}` : '/waiting-room';

  useMountEffect(() => {
    mainContainer.current?.appendChild(container);
  });

  return (
    <AppContextProvider container={container}>
      <div
        ref={mainContainer}
        className={['VeraRoom', 'h-full', className].filter(Boolean).join(' ')}
        {...props}
      >
        <MemoryRouter initialEntries={[initialEntry]}>
          <RoomProvider>
            <Routes>
              <Route path="/waiting-room/:roomIdentifier" element={<WaitingRoomStage />} />
              {/* Fallback route when no session-identifier attribute is set */}
              <Route path="/waiting-room" element={<WaitingRoomStage />} />
              <Route path="/room/:roomIdentifier" element={<MeetingRoomStage />} />
              <Route path="/goodbye/:roomIdentifier?" element={<GoodByeStage />} />
            </Routes>
          </RoomProvider>
        </MemoryRouter>
      </div>
    </AppContextProvider>
  );
};

export default VeraRoom;
