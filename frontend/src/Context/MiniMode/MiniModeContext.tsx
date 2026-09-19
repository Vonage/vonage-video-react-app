import {
  createContext,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import attempt from '@common/execution/attempt';
import useSessionContext from '@hooks/useSessionContext';
import usePublisherContext from '@hooks/usePublisherContext';
import useBackgroundPublisherContext from '@hooks/useBackgroundPublisherContext';
import useMountEffect from '@web/hooks/useMountEffect';
import useStableCallback from '@web/hooks/useStableCallback';
import { env } from '../../env';
import {
  captureNodeOrigin,
  copyStylesToDocument,
  isDocumentPictureInPictureSupported,
  restoreNodeOrigin,
  requestDocumentPictureInPictureWindow,
  syncStylesToWindow,
  type NodeOrigin,
} from '@common/documentPictureInPicture';
import frontendLogger from '../../logger';
import MiniCallWindow from '../../components/MeetingRoom/MiniCallWindow';
import resolveMiniModeParticipant, { type MiniModeParticipant } from './resolveMiniModeParticipant';

const PIP_WINDOW_SIZE = { width: 360, height: 260 };

export type MiniModeContextType = {
  isSupported: boolean;
  isOpen: boolean;
  hostedElement: HTMLVideoElement | HTMLObjectElement | null;
  enter: () => Promise<void>;
  exit: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  leave: () => void;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  participant: MiniModeParticipant | null;
};

const MiniModeContext = createContext<MiniModeContextType | null>(null);

export type MiniModeProviderProps = {
  children: ReactNode;
};

/**
 * Owns Document Picture-in-Picture for Mini Mode: opens the floating window,
 * re-parents the active-speaker video, and restores it on close.
 * @param {MiniModeProviderProps} props - Provider children
 * @returns {ReactElement} Context provider plus the Mini Call portal
 */
export const MiniModeProvider = ({ children }: MiniModeProviderProps): ReactElement => {
  const navigate = useNavigate();
  const {
    subscriberWrappers,
    activeSpeakerId,
    registerActiveSpeakerChangeHandler,
    unregisterActiveSpeakerChangeHandler,
    disconnect,
    sessionKey,
  } = useSessionContext();
  const {
    publisherVideoElement,
    publisher,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
  } = usePublisherContext();
  const { destroyBackgroundPublisher } = useBackgroundPublisherContext();

  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [hostedElement, setHostedElement] = useState<HTMLVideoElement | HTMLObjectElement | null>(
    null
  );
  const [participant, setParticipant] = useState<MiniModeParticipant | null>(null);

  const originRef = useRef<NodeOrigin | null>(null);
  const pipWindowRef = useRef<Window | null>(null);
  const hostedElementRef = useRef<HTMLVideoElement | HTMLObjectElement | null>(null);
  const stopStyleSyncRef = useRef<(() => void) | null>(null);

  const isSupported = env.ALLOW_MINI_MODE && isDocumentPictureInPictureSupported();
  const isOpen = pipWindow !== null;

  const restoreHostedElement = useCallback(() => {
    const element = hostedElementRef.current;
    const origin = originRef.current;
    if (element && origin) {
      restoreNodeOrigin(element, origin);
    }
    originRef.current = null;
    hostedElementRef.current = null;
    setHostedElement(null);
    setParticipant(null);
  }, []);

  const exit = useCallback(() => {
    restoreHostedElement();
    stopStyleSyncRef.current?.();
    stopStyleSyncRef.current = null;
    const currentWindow = pipWindowRef.current;
    pipWindowRef.current = null;
    setPipWindow(null);
    setMountNode(null);
    if (currentWindow && !currentWindow.closed) {
      currentWindow.close();
    }
  }, [restoreHostedElement]);

  const enter = useCallback(async () => {
    if (!isSupported || pipWindowRef.current) {
      return;
    }

    await attempt(
      async () => {
        const nextParticipant = resolveMiniModeParticipant(subscriberWrappers, activeSpeakerId, {
          element: publisherVideoElement,
          name: publisher?.stream?.name ?? '',
          initials: publisher?.stream?.initials ?? '',
        });

        const nextWindow = await requestDocumentPictureInPictureWindow(PIP_WINDOW_SIZE); // user-gesture required
        copyStylesToDocument(document, nextWindow.document);
        nextWindow.document.documentElement.style.height = '100%';
        nextWindow.document.body.style.margin = '0';
        nextWindow.document.body.style.width = '100%';
        nextWindow.document.body.style.height = '100%';
        nextWindow.document.body.style.backgroundColor = 'var(--vera-dark-grey, #2c2c2c)';

        const mount = nextWindow.document.createElement('div');
        mount.id = 'mini-mode-root';
        mount.style.width = '100%';
        mount.style.height = '100%';
        nextWindow.document.body.appendChild(mount);

        if (nextParticipant.element) {
          originRef.current = captureNodeOrigin(nextParticipant.element);
          hostedElementRef.current = nextParticipant.element;
          setHostedElement(nextParticipant.element);
        }

        pipWindowRef.current = nextWindow;
        setParticipant(nextParticipant);
        setPipWindow(nextWindow);
        setMountNode(mount);

        stopStyleSyncRef.current = syncStylesToWindow(document, nextWindow.document);

        nextWindow.addEventListener('pagehide', () => {
          stopStyleSyncRef.current?.();
          stopStyleSyncRef.current = null;
          restoreHostedElement();
          pipWindowRef.current = null;
          setPipWindow(null);
          setMountNode(null);
        });
      },
      (error) => {
        frontendLogger.reportError(error, {
          eventSource: 'miniMode.enter.error',
        });
      }
    );
  }, [
    activeSpeakerId,
    isSupported,
    publisher,
    publisherVideoElement,
    restoreHostedElement,
    subscriberWrappers,
  ]);

  // Stable handler that re-resolves the active-speaker participant and
  // switches the hosted video element inside the PiP window.
  // Always captures the latest subscriberWrappers / publisher via useStableCallback.
  const handleActiveSpeakerChange = useStableCallback((subscriberId: string | undefined) => {
    if (!isOpen) {
      return;
    }

    const nextParticipant = resolveMiniModeParticipant(subscriberWrappers, subscriberId, {
      element: publisherVideoElement,
      name: publisher?.stream?.name ?? '',
      initials: publisher?.stream?.initials ?? '',
    });

    const currentElement = hostedElementRef.current;
    if (nextParticipant.element === currentElement) {
      return;
    }

    // Restore the previously hosted element to its original position
    const origin = originRef.current;
    if (currentElement && origin) {
      restoreNodeOrigin(currentElement, origin);
    }

    // Capture the new element's origin; MiniCallWindow's useLayoutEffect
    // will move it into the PiP window's video host div
    if (nextParticipant.element) {
      originRef.current = captureNodeOrigin(nextParticipant.element);
      hostedElementRef.current = nextParticipant.element;
    }

    setHostedElement(nextParticipant.element ?? null);
    setParticipant(nextParticipant);
  });

  // Register the handler with SessionProvider's activeSpeakerTracker so that
  // it fires on the same activeSpeakerChanged event (lifecycle subscription,
  // not a reactive effect — the handler is stable via useStableCallback).
  useMountEffect(() => {
    registerActiveSpeakerChangeHandler(handleActiveSpeakerChange);
    return () => {
      unregisterActiveSpeakerChangeHandler(handleActiveSpeakerChange);
    };
  });

  const leave = useCallback(() => {
    exit();
    if (disconnect) {
      disconnect();
    }
    destroyBackgroundPublisher();
    void navigate(`/goodbye/${sessionKey ?? ''}`);
  }, [destroyBackgroundPublisher, disconnect, exit, navigate, sessionKey]);

  const value = useMemo<MiniModeContextType>(
    () => ({
      isSupported,
      isOpen,
      hostedElement,
      enter,
      exit,
      toggleAudio,
      toggleVideo,
      leave,
      isAudioEnabled,
      isVideoEnabled,
      participant,
    }),
    [
      enter,
      exit,
      hostedElement,
      isAudioEnabled,
      isOpen,
      isSupported,
      isVideoEnabled,
      leave,
      participant,
      toggleAudio,
      toggleVideo,
    ]
  );

  return (
    <MiniModeContext.Provider value={value}>
      {children}
      {mountNode &&
        createPortal(
          <MiniCallWindow
            participant={participant}
            hostedElement={hostedElement}
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onExpand={exit}
            onLeave={leave}
          />,
          mountNode
        )}
    </MiniModeContext.Provider>
  );
};

/**
 * Access Mini Mode enter/exit and the currently hosted video element.
 * Must be used within a `MiniModeProvider`.
 * @returns {MiniModeContextType} Mini Mode API
 * @throws {Error} If used outside a `MiniModeProvider`
 */
export const useMiniMode = (): MiniModeContextType => {
  const context = useContext(MiniModeContext);
  if (!context) {
    throw new Error('useMiniMode must be used within a MiniModeProvider');
  }
  return context;
};

export default MiniModeContext;
