import { useEffect, useRef } from 'react';

export type UsePushToTalkArgs = {
  enabled: boolean;
  isAudioEnabled: boolean;
  toggleAudio: () => void;
};

/**
 * React hook to add push-to-talk functionality using the Space key.
 *
 * When enabled, pressing and holding the Space key will unmute audio,
 * and releasing the Space key will mute audio again.
 */
const usePushToTalk = ({ enabled, isAudioEnabled, toggleAudio }: UsePushToTalkArgs): void => {
  const spaceKeyIsPressedRef = useRef<boolean>(false);
  const didUnmuteOnSpaceRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) return;

    const isTextEntryTarget = (target: EventTarget | null): boolean => {
      const node = target as HTMLElement | null;
      if (!node) return false;
      const tagName = node.tagName;
      if (tagName === 'INPUT' || tagName === 'TEXTAREA') return true;
      return node.isContentEditable === true;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const isSpace = event.code === 'Space' || event.key === ' ';
      if (!isSpace) return;
      if (isTextEntryTarget(event.target)) return;

      event.preventDefault();

      if (spaceKeyIsPressedRef.current) return;
      spaceKeyIsPressedRef.current = true;
      didUnmuteOnSpaceRef.current = false;

      // Only unmute on keydown if audio was muted.
      if (!isAudioEnabled) {
        didUnmuteOnSpaceRef.current = true;
        toggleAudio();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const isSpace = event.code === 'Space' || event.key === ' ';
      if (!isSpace) return;
      if (isTextEntryTarget(event.target)) return;

      event.preventDefault();
      spaceKeyIsPressedRef.current = false;
      // Only re-mute on keyup if we unmuted on keydown.
      if (didUnmuteOnSpaceRef.current) {
        didUnmuteOnSpaceRef.current = false;
        toggleAudio();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [enabled, isAudioEnabled, toggleAudio]);
};

export default usePushToTalk;
