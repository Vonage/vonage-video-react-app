import { useCallback, useEffect, useRef, useState } from 'react';
import copyStylesToDocument from './copyStylesToDocument';
import syncStylesToWindow from './syncStylesToWindow';

export type DocumentPictureInPictureWindowOptions = {
  width: number;
  height: number;
};

export type UseDocumentPictureInPictureOptions = {
  /** Called whenever the window closes, including closes not initiated via close() */
  onClose?: () => void;
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
 * Window and mount node are React state so consumers re-render when the window is
 * closed externally (user closes it, or the browser auto-closes it on tab return).
 */
export const useDocumentPictureInPicture = ({
  onClose,
}: UseDocumentPictureInPictureOptions = {}): DocumentPictureInPictureResult => {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const pipWindowRef = useRef<Window | null>(null);
  const stopStyleSyncRef = useRef<(() => void) | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const close = useCallback(() => {
    stopStyleSyncRef.current?.();
    stopStyleSyncRef.current = null;

    const currentWindow = pipWindowRef.current;
    if (currentWindow && !currentWindow.closed) {
      currentWindow.close();
    }
    pipWindowRef.current = null;
    setPipWindow(null);
    setMountNode(null);
  }, []);

  const handlePageHide = useCallback(() => {
    close();
    onCloseRef.current?.();
  }, [close]);

  const open = useCallback(
    async (options: DocumentPictureInPictureWindowOptions) => {
      const documentPictureInPicture = window.documentPictureInPicture;
      if (!documentPictureInPicture) {
        throw new Error('Document Picture-in-Picture is not supported');
      }

      const openedWindow = await documentPictureInPicture.requestWindow(options);

      // Copy styles from main document - essential for MUI/Tailwind rendering
      copyStylesToDocument(document, openedWindow.document);

      // Apply minimal inline styles to the PiP window
      openedWindow.document.documentElement.style.height = '100%';
      openedWindow.document.body.style.margin = '0';
      openedWindow.document.body.style.width = '100%';
      openedWindow.document.body.style.height = '100%';
      openedWindow.document.body.style.backgroundColor = 'var(--vera-dark-grey, #2c2c2c)';
      openedWindow.document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';

      // Create mount node for React portal
      const mount = openedWindow.document.createElement('div');
      mount.id = 'mini-mode-root';
      mount.style.width = '100%';
      mount.style.height = '100%';
      openedWindow.document.body.appendChild(mount);

      pipWindowRef.current = openedWindow;
      setPipWindow(openedWindow);
      setMountNode(mount);

      // Sync styles for dynamically injected content (MUI emotion CSS, etc.)
      stopStyleSyncRef.current = syncStylesToWindow(document, openedWindow.document);

      // Handle window close (user, or browser auto-close when returning to the tab)
      openedWindow.addEventListener('pagehide', handlePageHide);
    },
    [handlePageHide]
  );

  return {
    window: pipWindow,
    mountNode,
    open,
    close,
  };
};

export default useDocumentPictureInPicture;
