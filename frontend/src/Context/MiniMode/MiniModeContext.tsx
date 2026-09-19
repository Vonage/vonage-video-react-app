import {
  createContext,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
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
import { env } from '../../env';
import {
  captureNodeOrigin,
  copyStylesToDocument,
  isDocumentPictureInPictureSupported,
  restoreNodeOrigin,
  requestDocumentPictureInPictureWindow,
  syncStylesToWindow,
  type NodeOrigin,
} from '../../utils/documentPictureInPicture';
import frontendLogger from '../../logger';
import MiniCallWindow from '../../components/MeetingRoom/MiniCallWindow';
import buildPipWindowTitle from './buildPipWindowTitle';
import resolveMiniModeParticipant, { type MiniModeParticipant } from './resolveMiniModeParticipant';

const PIP_WINDOW_SIZE = { width: 360, height: 260 };

export { buildPipWindowTitle };
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
  const { subscriberWrappers, activeSpeakerId, disconnect, sessionKey, sessionDetails, archiveId } =
    useSessionContext();
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
        nextWindow.document.title = buildPipWindowTitle(
          sessionDetails?.roomName ?? publisher?.stream?.name ?? '',
          !!archiveId
        );
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
    archiveId,
    isSupported,
    publisher,
    publisherVideoElement,
    restoreHostedElement,
    sessionDetails,
    subscriberWrappers,
  ]);

  // Sync the PiP window title bar with the recording state.  This is the only
  // practical way to reflect archiveId changes (recording start/stop) in the
  // PiP title because the recording state lives in a different context
  // (SessionProvider) with no imperative call path to MiniModeContext.
  // The effect is a lightweight DOM-title sync, not a fetch, and only acts
  // when a PiP window is actually open.
  useEffect(() => {
    const pipWindow = pipWindowRef.current;
    if (!pipWindow || pipWindow.closed) {
      return;
    }
    const meetingName = sessionDetails?.roomName ?? publisher?.stream?.name ?? '';
    pipWindow.document.title = buildPipWindowTitle(meetingName, !!archiveId);
  }, [archiveId, sessionDetails, publisher]);

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

const unsupportedMiniMode: MiniModeContextType = {
  isSupported: false,
  isOpen: false,
  hostedElement: null,
  enter: () => Promise.resolve(),
  exit: () => undefined,
  toggleAudio: () => undefined,
  toggleVideo: () => undefined,
  leave: () => undefined,
  isAudioEnabled: true,
  isVideoEnabled: true,
  participant: null,
};

/**
 * Access Mini Mode enter/exit and the currently hosted video element.
 * @returns {MiniModeContextType} Mini Mode API; no-ops when the provider is missing
 */
export const useMiniMode = (): MiniModeContextType =>
  useContext(MiniModeContext) ?? unsupportedMiniMode;

export default MiniModeContext;
