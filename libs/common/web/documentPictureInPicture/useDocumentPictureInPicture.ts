import { useCallback, useRef, useState } from 'react';
import copyStylesToDocument from './copyStylesToDocument';
import syncStylesToWindow from './syncStylesToWindow';
import waitForStylesheets from './waitForStylesheets';

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
 * Opens and closes a Document Picture-in-Picture window and exposes a mount node for React portals.
 * The opener's styles are copied in, and kept in sync, before the mount node is exposed.
 * State resets when the browser closes the window too (user close, or returning to the tab).
 * @returns {DocumentPictureInPictureResult} The open window, its mount node, and open/close actions
 */
export const useDocumentPictureInPicture = (): DocumentPictureInPictureResult => {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const pipWindowRef = useRef<Window | null>(null);
  const stopStyleSyncRef = useRef<(() => void) | null>(null);

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

  const open = useCallback(
    async (options: DocumentPictureInPictureWindowOptions) => {
      const documentPictureInPicture = window.documentPictureInPicture;
      if (!documentPictureInPicture) {
        throw new Error('Document Picture-in-Picture is not supported');
      }

      const openedWindow = await documentPictureInPicture.requestWindow(options);

      copyStylesToDocument(document, openedWindow.document);
      await waitForStylesheets(openedWindow.document);

      if (openedWindow.closed) {
        throw new Error('Picture-in-Picture window closed before its styles loaded');
      }

      openedWindow.document.documentElement.style.height = '100%';
      openedWindow.document.body.style.margin = '0';
      openedWindow.document.body.style.width = '100%';
      openedWindow.document.body.style.height = '100%';

      const mount = openedWindow.document.createElement('div');
      mount.id = 'mini-mode-root';
      mount.style.width = '100%';
      mount.style.height = '100%';
      openedWindow.document.body.appendChild(mount);

      pipWindowRef.current = openedWindow;
      setPipWindow(openedWindow);
      setMountNode(mount);

      stopStyleSyncRef.current = syncStylesToWindow(document, openedWindow.document);

      openedWindow.addEventListener('pagehide', close);
    },
    [close]
  );

  return {
    window: pipWindow,
    mountNode,
    open,
    close,
  };
};

export default useDocumentPictureInPicture;
