import React, { PropsWithChildren } from 'react';
import { AudioOutputProvider } from './AudioOutputProvider';
import { BackgroundPublisherProvider } from './BackgroundPublisherProvider';
import SessionProvider from './SessionProvider/session';

/**
 * @description RoomContext - Wrapper for all of the contexts used by the waiting room and the meeting room.
 * @param {PropsWithChildren} props - The props for the RoomContext component.
 * @property {ReactNode} props.children - The content to be rendered within the RoomContext.
 * @returns {React.FC} A React functional component that provides the RoomContext.
 */
const RoomContext: React.FC<PropsWithChildren> = ({ children }) => (
  <BackgroundPublisherProvider>
    <AudioOutputProvider>
      <SessionProvider>{children}</SessionProvider>
    </AudioOutputProvider>
  </BackgroundPublisherProvider>
);

export default RoomContext;
