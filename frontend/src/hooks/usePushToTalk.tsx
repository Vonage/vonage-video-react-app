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
  const didUnmuteOnSpaceRef = useRef<boolean>(false);
  const audioStateRef = useRef<{ isAudioEnabled: boolean; toggleAudio: () => void }>({
    isAudioEnabled,
    toggleAudio,
  });

  audioStateRef.current.isAudioEnabled = isAudioEnabled;
  audioStateRef.current.toggleAudio = toggleAudio;

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
      if (event.repeat) return;
      didUnmuteOnSpaceRef.current = false;

      // Only unmute on keydown if audio was muted.
      if (!audioStateRef.current.isAudioEnabled) {
        didUnmuteOnSpaceRef.current = true;
        audioStateRef.current.toggleAudio();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const isSpace = event.code === 'Space' || event.key === ' ';
      if (!isSpace) return;
      if (isTextEntryTarget(event.target)) return;

      // Only re-mute on keyup if we unmuted on keydown.
      if (didUnmuteOnSpaceRef.current) {
        didUnmuteOnSpaceRef.current = false;
        audioStateRef.current.toggleAudio();
      }
    };

    globalThis.addEventListener('keydown', onKeyDown);
    globalThis.addEventListener('keyup', onKeyUp);

    return () => {
      didUnmuteOnSpaceRef.current = false;
      globalThis.removeEventListener('keydown', onKeyDown);
      globalThis.removeEventListener('keyup', onKeyUp);
    };
  }, [enabled]);
};

export default usePushToTalk;
