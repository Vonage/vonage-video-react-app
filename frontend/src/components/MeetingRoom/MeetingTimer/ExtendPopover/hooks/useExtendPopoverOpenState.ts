import { useState } from 'react';
import useStableCallback from '@web/hooks/useStableCallback';

type OpenChoice = {
  endsAt: number;
  isOpen: boolean;
};

/**
 * Whether the extend popover is open. Until someone opens or closes it for the current end time,
 * it follows `shouldOpenByItself`, so a new end time after an extension starts from scratch.
 */
const useExtendPopoverOpenState = ({
  endsAt,
  shouldOpenByItself,
}: {
  endsAt: number;
  shouldOpenByItself: boolean;
}) => {
  const [openChoice, setOpenChoice] = useState<OpenChoice | null>(null);

  const isOpen = (() => {
    if (openChoice?.endsAt !== endsAt) return shouldOpenByItself;
    return openChoice.isOpen;
  })();

  const setIsOpen = useStableCallback((nextIsOpen: boolean) => {
    setOpenChoice({ endsAt, isOpen: nextIsOpen });
  });

  return { isOpen, setIsOpen };
};

export default useExtendPopoverOpenState;
