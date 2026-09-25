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
  isDocumentPictureInPictureSupported,
  registerEnterPictureInPictureAction,
  useDocumentPictureInPicture,
} from '@common/documentPictureInPicture';
import frontendLogger from '../../logger';
import type { SubscriberWrapper } from '../../types/session';
import MiniCallWindow from '../../components/MeetingRoom/MiniCallWindow';

const PIP_WINDOW_SIZE = { width: 360, height: 260 };

export type MiniModeHostedElement = HTMLVideoElement | HTMLObjectElement | null;

type MiniModeParticipant = {
  element: MiniModeHostedElement;
  name: string;
  initials: string;
};

export type MiniModeContextType = {
  isSupported: boolean;
  isOpen: boolean;
  hostedElement: MiniModeHostedElement;
  enter: () => Promise<void>;
  exit: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  leave: () => void;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  participant: MiniModeParticipant | null;
};

export type { MiniModeParticipant };

const MiniModeContext = createContext<MiniModeContextType | null>(null);

export type MiniModeProviderProps = {
  children: ReactNode;
};

/**
 * Resolves which participant to show in Mini Mode.
 * Inline simplified version of the previous separate function.
 */
const resolveMiniModeParticipant = (
  subscriberWrappers: SubscriberWrapper[],
  activeSpeakerId: string | undefined,
  publisher: {
    element: MiniModeHostedElement;
    name: string;
    initials: string;
  }
): MiniModeParticipant => {
  const cameraSubscribers = subscriberWrappers.filter((wrapper) => !wrapper.isScreenshare);
  const activeSpeaker =
    cameraSubscribers.find((wrapper) => wrapper.id === activeSpeakerId) ?? cameraSubscribers[0];

  if (activeSpeaker) {
    return {
      element: activeSpeaker.element,
      name: activeSpeaker.subscriber.stream?.name ?? '',
      initials: activeSpeaker.subscriber.stream?.initials ?? '',
    };
  }

  return {
    element: publisher.element,
    name: publisher.name,
    initials: publisher.initials,
  };
};

/**
 * Simplified Mini Mode Context - owns Document Picture-in-Picture lifecycle.
 * Opens floating window, re-parents active-speaker video, restores on close.
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
    archiveId,
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

  const [hostedElement, setHostedElement] = useState<MiniModeHostedElement>(null);
  const [participant, setParticipant] = useState<MiniModeParticipant | null>(null);
  const originalParentRef = useRef<HTMLElement | null>(null);
  const hostedElementRef = useRef<MiniModeHostedElement>(null);

  const restoreHostedElement = useCallback(() => {
    const element = hostedElementRef.current;
    const parent = originalParentRef.current;
    if (element && parent) {
      parent.appendChild(element);
    }
    originalParentRef.current = null;
    hostedElementRef.current = null;
    setHostedElement(null);
    setParticipant(null);
  }, []);

  // onClose also covers closes we did not initiate: the user closing the window,
  // or the browser auto-closing it when the tab becomes visible again.
  const {
    window: pipWindow,
    mountNode,
    open: openPipWindow,
    close: closePipWindow,
  } = useDocumentPictureInPicture({ onClose: restoreHostedElement });

  const subscriberWrappersRef = useRef(subscriberWrappers);
  const publisherVideoElementRef = useRef(publisherVideoElement);
  const publisherRef = useRef(publisher);
  const isOpenRef = useRef(pipWindow !== null);

  const isSupported = env.ALLOW_MINI_MODE && isDocumentPictureInPictureSupported();
  const isOpen = pipWindow !== null;

  // Keep refs in sync with latest values
  useEffect(() => {
    hostedElementRef.current = hostedElement;
    subscriberWrappersRef.current = subscriberWrappers;
    publisherVideoElementRef.current = publisherVideoElement;
    publisherRef.current = publisher;
    isOpenRef.current = isOpen;
  }, [hostedElement, subscriberWrappers, publisherVideoElement, publisher, isOpen]);

  const exit = useCallback(() => {
    restoreHostedElement();
    closePipWindow();
  }, [restoreHostedElement, closePipWindow]);

  const enter = useCallback(async () => {
    if (!isSupported || isOpenRef.current) {
      return;
    }

    await attempt(
      async () => {
        const nextParticipant = resolveMiniModeParticipant(subscriberWrappers, activeSpeakerId, {
          element: publisherVideoElement,
          name: publisher?.stream?.name ?? '',
          initials: publisher?.stream?.initials ?? '',
        });

        await openPipWindow(PIP_WINDOW_SIZE);

        if (nextParticipant.element) {
          originalParentRef.current = nextParticipant.element.parentElement;
          setHostedElement(nextParticipant.element);
        }

        setParticipant(nextParticipant);
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
    subscriberWrappers,
    openPipWindow,
  ]);

  // Simplified active speaker switching - direct DOM manipulation
  const handleActiveSpeakerChange = useCallback(
    (subscriberId: string | undefined) => {
      if (!isOpenRef.current) return;

      const nextParticipant = resolveMiniModeParticipant(
        subscriberWrappersRef.current,
        subscriberId,
        {
          element: publisherVideoElementRef.current,
          name: publisherRef.current?.stream?.name ?? '',
          initials: publisherRef.current?.stream?.initials ?? '',
        }
      );

      if (nextParticipant.element === hostedElementRef.current) return;

      // Restore current element
      restoreHostedElement();

      // Set up new element
      if (nextParticipant.element) {
        originalParentRef.current = nextParticipant.element.parentElement;
        setHostedElement(nextParticipant.element);
      }

      setParticipant(nextParticipant);
    },
    [restoreHostedElement]
  );

  useEffect(() => {
    registerActiveSpeakerChangeHandler(handleActiveSpeakerChange);
    return () => {
      unregisterActiveSpeakerChangeHandler(handleActiveSpeakerChange);
    };
  }, [
    handleActiveSpeakerChange,
    registerActiveSpeakerChangeHandler,
    unregisterActiveSpeakerChangeHandler,
  ]);

  // Automatic Picture-in-Picture: Chromium invokes this action when the user
  // switches tabs while we capture camera/mic, allowing enter() without a gesture.
  // Registered once per publisher and dispatched through a ref so the handler
  // is not torn down every time enter() is recreated (active speaker changes etc).
  const enterRef = useRef(enter);
  useEffect(() => {
    enterRef.current = enter;
  }, [enter]);

  useEffect(() => {
    if (!isSupported || !publisher) {
      return undefined;
    }
    return registerEnterPictureInPictureAction(() => {
      void enterRef.current();
    });
  }, [isSupported, publisher]);

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
            containerWidth={PIP_WINDOW_SIZE.width}
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            isRecording={!!archiveId}
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

export const useMiniMode = (): MiniModeContextType => {
  const context = useContext(MiniModeContext);
  if (!context) {
    throw new Error('useMiniMode must be used within a MiniModeProvider');
  }
  return context;
};

export default MiniModeContext;
