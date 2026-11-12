import {
  createContext,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import attempt from '@common/execution/attempt';
import useSessionContext from '@hooks/useSessionContext';
import usePublisherContext from '@hooks/usePublisherContext';
import useLeaveMeeting from '@hooks/useLeaveMeeting';
import {
  registerEnterPictureInPictureAction,
  useDocumentPictureInPicture,
} from '@web/documentPictureInPicture';
import frontendLogger from '../../logger';
import MiniCallWindow from '../../components/MeetingRoom/MiniCallWindow';
import MiniCallWindowStylesProvider from '../../components/MeetingRoom/MiniCallWindow/MiniCallWindowStylesProvider';
import { preloadMiniModeIcons } from '../../components/MeetingRoom/MiniCallWindow/useIconSvg';
import isMiniModeSupported from './isMiniModeSupported';
import resolveMiniModeParticipant, {
  type MiniModeHostedElement,
} from './helpers/resolveMiniModeParticipant';

const PIP_WINDOW_SIZE = { width: 360, height: 260 };

export type MiniModeContextType = {
  isAvailable: boolean;
  isOpen: boolean;
  hostedElement: MiniModeHostedElement;
  enter: () => Promise<void>;
  exit: () => void;
};

const MiniModeContext = createContext<MiniModeContextType | null>(null);

export type MiniModeProviderProps = {
  children: ReactNode;
};

/**
 * Owns the Mini Mode Document Picture-in-Picture window and renders the call into it.
 * The participant shown is derived from the session on every render, so it follows the active speaker.
 * @param {MiniModeProviderProps} props - The meeting room content
 * @returns {ReactElement} The provider and, while open, the Mini Mode window portal
 */
export const MiniModeProvider = ({ children }: MiniModeProviderProps): ReactElement => {
  const {
    subscriberWrappers,
    activeSpeakerId,
    archiveId,
    recordingArchiveId,
    transcriptionArchiveId,
  } = useSessionContext();
  const {
    publisher,
    publisherVideoElement,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
  } = usePublisherContext();
  const leaveMeeting = useLeaveMeeting();
  const { window: pipWindow, mountNode, open, close } = useDocumentPictureInPicture();

  const isAvailable = isMiniModeSupported();
  const isOpen = pipWindow !== null;
  const isRecording = !!recordingArchiveId || (!!archiveId && archiveId !== transcriptionArchiveId);
  const participant = isOpen
    ? resolveMiniModeParticipant({
        subscriberWrappers,
        activeSpeakerId,
        publisher,
        publisherVideoElement,
        isPublisherVideoEnabled: isVideoEnabled,
      })
    : null;
  const hostedElement = participant?.element ?? null;

  const enter = useCallback(async () => {
    if (!isAvailable || isOpen) return;

    preloadMiniModeIcons();
    await attempt(
      () => open(PIP_WINDOW_SIZE),
      (error) => frontendLogger.reportError(error, { eventSource: 'miniMode.enter.error' })
    );
  }, [isAvailable, isOpen, open]);

  useEffect(() => {
    if (!isAvailable || !publisher) return undefined;

    return registerEnterPictureInPictureAction(() => {
      void enter();
    });
  }, [isAvailable, publisher, enter]);

  const leave = () => {
    close();
    leaveMeeting();
  };

  const value = useMemo<MiniModeContextType>(
    () => ({ isAvailable, isOpen, hostedElement, enter, exit: close }),
    [isAvailable, isOpen, hostedElement, enter, close]
  );

  return (
    <MiniModeContext.Provider value={value}>
      {children}
      {mountNode &&
        participant &&
        createPortal(
          <MiniCallWindowStylesProvider targetDocument={mountNode.ownerDocument}>
            <MiniCallWindow
              participant={participant}
              containerWidth={PIP_WINDOW_SIZE.width}
              isAudioEnabled={isAudioEnabled}
              isVideoEnabled={isVideoEnabled}
              isRecording={isRecording}
              onToggleAudio={toggleAudio}
              onToggleVideo={toggleVideo}
              onExpand={close}
              onLeave={leave}
            />
          </MiniCallWindowStylesProvider>,
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
