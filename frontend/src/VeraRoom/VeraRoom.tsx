import classNames from 'classnames';
import type { ComponentProps, FC } from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import AppContextProvider from '../AppContextProvider';
import RoomProvider from '@Context/RoomProvider';
import bridge$ from './stores/bridge';
import WaitingRoomStage from './stages/WaitingRoomStage';
import MeetingRoomStage from './stages/MeetingRoomStage';
import GoodByeStage from './stages/GoodByeStage';

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
  const sessionIdentifier = bridge$.use.select((state) => state.sessionIdentifier);
  const initialEntry = sessionIdentifier ? `/waiting-room/${sessionIdentifier}` : '/waiting-room';

  return (
    <AppContextProvider>
      <div className={twMerge(classNames('VeraRoom w-full h-full', className))} {...props}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <RoomProvider>
            <Routes>
              <Route path="/waiting-room/:roomName" element={<WaitingRoomStage />} />
              {/* Fallback route when no session-identifier attribute is set */}
              <Route path="/waiting-room" element={<WaitingRoomStage />} />
              <Route path="/room/:roomName" element={<MeetingRoomStage />} />
              <Route path="/goodbye" element={<GoodByeStage />} />
            </Routes>
          </RoomProvider>
        </MemoryRouter>
      </div>
    </AppContextProvider>
  );
};

export default VeraRoom;
