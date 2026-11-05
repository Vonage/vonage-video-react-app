import type { PropsWithChildren, ReactNode } from 'react';

/**
 * Creates a named pass-through slot component for PrepareToJoinCard.
 */
function PrepareToJoinCardSlot(displayName: string) {
  const Slot = ({ children }: PropsWithChildren): ReactNode => children;
  Slot.displayName = displayName;
  return Slot;
}

export default PrepareToJoinCardSlot;
