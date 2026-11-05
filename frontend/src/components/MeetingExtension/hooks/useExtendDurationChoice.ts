import { useState } from 'react';
import { isNil } from '@common/assertions';
import useStableCallback from '@web/hooks/useStableCallback';
import useExtendMeeting from './useExtendMeeting';

/**
 * The duration picked for an extension, and the confirm action that applies it.
 */
const useExtendDurationChoice = () => {
  const extendMeeting = useExtendMeeting();
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [isExtending, setIsExtending] = useState(false);

  const confirm = useStableCallback(async () => {
    if (isNil(selectedMinutes)) return;

    setIsExtending(true);
    await extendMeeting(selectedMinutes);
    setIsExtending(false);
  });

  return {
    selectedMinutes,
    selectMinutes: setSelectedMinutes,
    isConfirmDisabled: isNil(selectedMinutes) || isExtending,
    confirm,
  };
};

export default useExtendDurationChoice;
