import type { PropsWithChildren, ReactNode } from 'react';

/**
 * Creates a named pass-through slot component for MeetingRoomBackdrop.
 */
function MeetingRoomBackdropSlot(displayName: string) {
  const Slot = ({ children }: PropsWithChildren): ReactNode => children;
  Slot.displayName = displayName;

  return Slot;
}

export default MeetingRoomBackdropSlot;
