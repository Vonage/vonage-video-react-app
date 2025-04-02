import {
  useState,
  createContext,
  useRef,
  ReactNode,
  useMemo,
  useCallback,
  Dispatch,
  SetStateAction,
  useEffect,
  ReactElement,
} from 'react';
import { Connection, Stream } from '@vonage/client-sdk-video';
import fetchCredentials from '../../api/fetchCredentials';
import useUserContext from '../../hooks/useUserContext';
import ActiveSpeakerTracker from '../../utils/ActiveSpeakerTracker';
import useRightPanel, { RightPanelActiveTab } from '../../hooks/useRightPanel';
import {
  Credential,
  SignalEvent,
  SubscriberAudioLevelUpdatedEvent,
  SubscriberWrapper,
} from '../../types/session';
import useChat from '../../hooks/useChat';
import { ChatMessageType } from '../../types/chat';
import { isMobile } from '../../utils/util';
import {
  sortByDisplayPriority,
  togglePinAndSortByDisplayOrder,
} from '../../utils/sessionStateOperations';
import { MAX_PIN_COUNT_DESKTOP, MAX_PIN_COUNT_MOBILE } from '../../utils/constants';
import VonageVideoClient from '../../utils/VonageVideoClient';

export type { ChatMessageType } from '../../types/chat';

export type LayoutMode = 'grid' | 'active-speaker';

export type SessionContextType = {
  session: null | VonageVideoClient;
  connect: null | ((credential: Credential) => Promise<void>);
  disconnect: null | (() => void);
  joinRoom: null | ((roomName: string) => Promise<void>);
  forceMute: null | ((stream: Stream) => Promise<void>);
  connected: null | boolean;
  unreadCount: number;
  messages: ChatMessageType[];
  sendChatMessage: (text: string) => void;
  reconnecting: null | boolean;
  subscriberWrappers: SubscriberWrapper[];
  activeSpeakerId: string | undefined;
  layoutMode: LayoutMode;
  setLayoutMode: Dispatch<SetStateAction<LayoutMode>>;
  archiveId: string | null;
  rightPanelActiveTab: RightPanelActiveTab;
  toggleParticipantList: () => void;
  toggleChat: () => void;
  closeRightPanel: () => void;
  toggleReportIssue: () => void;
  pinSubscriber: (subscriberId: string) => void;
  isMaxPinned: boolean;
};

/**
 * Context to provide session-related data and actions.
 */
export const SessionContext = createContext<SessionContextType>({
  session: null,
  connect: null,
  disconnect: null,
  joinRoom: null,
  forceMute: null,
  connected: null,
  unreadCount: 0,
  messages: [],
  sendChatMessage: () => {},
  reconnecting: null,
  subscriberWrappers: [],
  activeSpeakerId: undefined,
  layoutMode: 'grid',
  setLayoutMode: () => {},
  archiveId: null,
  rightPanelActiveTab: 'closed',
  toggleParticipantList: () => {},
  toggleChat: () => {},
  closeRightPanel: () => {},
  toggleReportIssue: () => {},
  pinSubscriber: () => {},
  isMaxPinned: false,
});

export type ConnectionEventType = {
  connection: Connection;
  reason?: string;
  id?: string;
};

/**
 * @typedef {object} SessionProviderProps
 * @property {ReactNode} children - The content to be rendered as children.
 */
export type SessionProviderProps = {
  children: ReactNode;
};

const MAX_PIN_COUNT = isMobile() ? MAX_PIN_COUNT_MOBILE : MAX_PIN_COUNT_DESKTOP;

/**
 * SessionProvider - React Context Provider for SessionProvider
 * Provides session context to the component tree, including managing subscribers, connections, and layout mode.
 * We use Context to make the Session object available in many components across the app without
 * prop drilling: https://react.dev/learn/passing-data-deeply-with-context#use-cases-for-context
 * @param {SessionProviderProps} props - The provider properties
 * @returns {SessionContextType} a context provider for a publisher preview
 */
const SessionProvider = ({ children }: SessionProviderProps): ReactElement => {
  const [, forceUpdate] = useState<boolean>(false); // NOSONAR
  const session = useRef<null | VonageVideoClient>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [subscriberWrappers, setSubscriberWrappers] = useState<SubscriberWrapper[]>([]);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('active-speaker');
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const activeSpeakerTracker = useRef<ActiveSpeakerTracker>(new ActiveSpeakerTracker());
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | undefined>();
  const activeSpeakerIdRef = useRef<string | undefined>(undefined);
  const { messages, onChatMessage, sendChatMessage } = useChat({ sessionRef: session });
  const {
    closeRightPanel,
    toggleParticipantList,
    toggleChat,
    rightPanelState: { unreadCount, activeTab: rightPanelActiveTab },
    incrementUnreadCount,
    toggleReportIssue,
  } = useRightPanel();

  const handleChatSignal = ({ data }: SignalEvent) => {
    if (data) {
      onChatMessage(data);
      incrementUnreadCount();
    }
  };

  const setActiveSpeakerIdAndRef = useCallback((id: string | undefined) => {
    // We store the current active speaker id in a ref so it can be accessed later when sorting the subscriberWrappers for display.
    activeSpeakerIdRef.current = id;
    setActiveSpeakerId(id);
  }, []);

  /**
   * Moves the subscriber with the specified ID to the top of the display order.
   * @param {string} id - The ID of the subscriber to move.
   */
  const moveSubscriberToTopOfDisplayOrder = useCallback((id: string) => {
    setSubscriberWrappers((prevSubscriberWrappers) => {
      const activeSpeakerWrapper = prevSubscriberWrappers.find(
        ({ id: streamId }) => streamId === id
      );
      if (activeSpeakerWrapper) {
        // We use a ref to access the value for activeSpeakerId, because it is not updated in the context of this state and shows up as its initial state, undefined.
        // When passing the sort function callback, the initial value of activeSpeakerId is captured when the listener is added. Updates to the
        // activeSpeakerId are not reflected when it is accessed. A workaround is to use useRef to store state.
        // See: https://stackoverflow.com/questions/53845595/wrong-react-hooks-behaviour-with-event-listener
        return prevSubscriberWrappers.sort(sortByDisplayPriority(id));
      }
      return prevSubscriberWrappers;
    });
  }, []);

  /**
   * isMaxPinned {boolean} - whether the maximum number of allowed pinned participants has been reached.
   * This is used to disable the pin buttons so no more participants can be pinned.
   */
  const isMaxPinned = useMemo(() => {
    const pinnedCount = subscriberWrappers.filter((sub) => sub.isPinned).length;
    return pinnedCount >= MAX_PIN_COUNT;
  }, [subscriberWrappers]);

  /**
   * Toggles a subscriber's isPinned field, and sorts subscribers by display priority.
   * @param {string} id - The ID of the subscriber to pin.
   */
  const pinSubscriber = useCallback(
    (id: string) => {
      setSubscriberWrappers((previousSubscriberWrappers) => {
        return togglePinAndSortByDisplayOrder(id, previousSubscriberWrappers, activeSpeakerId);
      });
    },
    [activeSpeakerId]
  );

  // hook to keep track of the active speaker during the call and move it to the top of the display order
  useEffect(() => {
    activeSpeakerTracker.current.on('activeSpeakerChanged', ({ newActiveSpeaker }) => {
      const { subscriberId } = newActiveSpeaker;
      setActiveSpeakerIdAndRef(subscriberId);
      if (subscriberId) {
        moveSubscriberToTopOfDisplayOrder(subscriberId);
      }
    });
  }, [moveSubscriberToTopOfDisplayOrder, setActiveSpeakerIdAndRef]);

  const { user } = useUserContext();
  const [connected, setConnected] = useState(false);

  /**
   * Handles changes to stream properties. This triggers a re-render when a stream property changes
   */
  const handleStreamPropertyChanged = () => {
    forceUpdate((prev) => !prev);
  };

  // handle the disconnect from session and clean up of the session object
  const handleSessionDisconnected = () => {
    session.current = null;
    setConnected(false);
  };

  // function to set reconnecting status and to increase the number of reconnections the user has had
  // this reconnection count can be then used in the UI to provide user feedback or for post-call analytics
  const handleReconnecting = () => {
    if (user) {
      user.issues.reconnections += 1;
    }

    setReconnecting(true);
  };
  const handleReconnected = () => {
    setReconnecting(false);
  };

  const handleArchiveStarted = (id: string) => {
    setArchiveId(id);
  };

  const handleArchiveStopped = () => {
    setArchiveId(null);
  };

  const handleSubscriberVideoElementCreated = (subscriberWrapper: SubscriberWrapper) => {
    setSubscriberWrappers((previousSubscriberWrappers) =>
      [subscriberWrapper, ...previousSubscriberWrappers].sort(
        sortByDisplayPriority(activeSpeakerIdRef.current)
      )
    );
  };

  const handleSubscriberDestroyed = (streamId: string) => {
    activeSpeakerTracker.current.onSubscriberDestroyed(streamId);
    const isNotDestroyedStreamId = ({ id }: { id: string }) => streamId !== id;
    setSubscriberWrappers((prevSubscriberWrappers) =>
      prevSubscriberWrappers.filter(isNotDestroyedStreamId)
    );
  };

  const handleSubscriberAudioLevelUpdated = ({
    movingAvg,
    subscriberId,
  }: SubscriberAudioLevelUpdatedEvent) => {
    activeSpeakerTracker.current.onSubscriberAudioLevelUpdated({
      subscriberId,
      movingAvg,
    });
  };

  /**
   * Connects to the session using the provided credentials.
   * @param {Credential} credential - The credentials for the session.
   * @returns {Promise<void>} A promise that resolves when the session is connected.
   */
  const connect = useCallback(async (credential: Credential) => {
    if (session.current) {
      return;
    }
    try {
      // initialize the session object and set up the relevant event listeners
      // https://tokbox.com/developer/sdks/js/reference/Session.html#events for opentok
      // https://vonage.github.io/conversation-docs/video-js-reference/latest/Session.html#events for unified environment
      session.current = new VonageVideoClient(credential);
      session.current.on('streamPropertyChanged', handleStreamPropertyChanged);
      session.current.on('sessionReconnecting', handleReconnecting);
      session.current.on('sessionReconnected', handleReconnected);
      session.current.on('sessionDisconnected', handleSessionDisconnected);
      session.current.on('archiveStarted', handleArchiveStarted);
      session.current.on('archiveStopped', handleArchiveStopped);
      session.current.on('signal:chat', handleChatSignal);
      session.current.on('subscriberAudioLevelUpdated', handleSubscriberAudioLevelUpdated);
      session.current.on('subscriberVideoElementCreated', handleSubscriberVideoElementCreated);
      session.current.on('subscriberDestroyed', handleSubscriberDestroyed);
      await session.current.connect(credential);
      setConnected(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Joins a room by fetching the necessary credentials and connecting to the session.
   * @param {string} roomName - The name of the room to join.
   */
  const joinRoom = useCallback(async (roomName: string) => {
    fetchCredentials(roomName)
      .then((credentials) => {
        connect(credentials.data);
      })
      .catch(console.warn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Disconnects from the current session and cleans up session-related resources.
   */
  const disconnect = useCallback(() => {
    if (session.current) {
      session.current.disconnect();

      setConnected(false);
    }
  }, []);

  /**
   * Force mutes a participant.
   * @param {Stream} stream - The stream that is going to be muted.
   */
  const forceMute = useCallback(async (stream: Stream) => {
    if (session.current) {
      session.current.forceMuteStream(stream);
    }
  }, []);

  const value = useMemo(
    () => ({
      activeSpeakerId,
      archiveId,
      session: session.current,
      connect,
      disconnect,
      joinRoom,
      forceMute,
      connected,
      unreadCount,
      messages,
      sendChatMessage,
      reconnecting,
      subscriberWrappers,
      layoutMode,
      setLayoutMode,
      rightPanelActiveTab,
      toggleParticipantList,
      toggleChat,
      closeRightPanel,
      toggleReportIssue,
      pinSubscriber,
      isMaxPinned,
    }),
    [
      activeSpeakerId,
      archiveId,
      session,
      connect,
      disconnect,
      unreadCount,
      messages,
      sendChatMessage,
      joinRoom,
      forceMute,
      connected,
      reconnecting,
      subscriberWrappers,
      layoutMode,
      setLayoutMode,
      rightPanelActiveTab,
      toggleParticipantList,
      toggleChat,
      closeRightPanel,
      toggleReportIssue,
      pinSubscriber,
      isMaxPinned,
    ]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};
export default SessionProvider;
