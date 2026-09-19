import { useCallback, useRef } from 'react';
import copyStylesToDocument from './copyStylesToDocument';
import syncStylesToWindow from './syncStylesToWindow';

export type DocumentPictureInPictureWindowOptions = {
  width: number;
  height: number;
};

export type DocumentPictureInPictureResult = {
  window: Window | null;
  mountNode: HTMLElement | null;
  open: (options: DocumentPictureInPictureWindowOptions) => Promise<void>;
  close: () => void;
};

/**
 * Simplified Document Picture-in-Picture hook.
 * Handles opening/closing the PiP window and provides a mount node for React portals.
 * Copies styles from the main document so the PiP window renders correctly.
 */
export const useDocumentPictureInPicture = (): DocumentPictureInPictureResult => {
  const pipWindowRef = useRef<Window | null>(null);
  const mountNodeRef = useRef<HTMLElement | null>(null);
  const stopStyleSyncRef = useRef<(() => void) | null>(null);

  const close = useCallback(() => {
    stopStyleSyncRef.current?.();
    stopStyleSyncRef.current = null;

    const currentWindow = pipWindowRef.current;
    if (currentWindow && !currentWindow.closed) {
      currentWindow.close();
    }
    pipWindowRef.current = null;
    mountNodeRef.current = null;
  }, []);

  const open = useCallback(
    async (options: DocumentPictureInPictureWindowOptions) => {
      const documentPictureInPicture = window.documentPictureInPicture;
      if (!documentPictureInPicture) {
        throw new Error('Document Picture-in-Picture is not supported');
      }

      const pipWindow = await documentPictureInPicture.requestWindow(options);

      // Copy styles from main document - essential for MUI/Tailwind rendering
      copyStylesToDocument(document, pipWindow.document);

      // Apply minimal inline styles to the PiP window
      pipWindow.document.documentElement.style.height = '100%';
      pipWindow.document.body.style.margin = '0';
      pipWindow.document.body.style.width = '100%';
      pipWindow.document.body.style.height = '100%';
      pipWindow.document.body.style.backgroundColor = 'var(--vera-dark-grey, #2c2c2c)';
      pipWindow.document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';

      // Create mount node for React portal
      const mount = pipWindow.document.createElement('div');
      mount.id = 'mini-mode-root';
      mount.style.width = '100%';
      mount.style.height = '100%';
      pipWindow.document.body.appendChild(mount);

      pipWindowRef.current = pipWindow;
      mountNodeRef.current = mount;

      // Sync styles for dynamically injected content (MUI emotion CSS, etc.)
      stopStyleSyncRef.current = syncStylesToWindow(document, pipWindow.document);

      // Handle window close
      pipWindow.addEventListener('pagehide', close);
    },
    [close]
  );

  return {
    window: pipWindowRef.current,
    mountNode: mountNodeRef.current,
    open,
    close,
  };
};

export default useDocumentPictureInPicture;
