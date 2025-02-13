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
import { v4 as uuid } from 'uuid';
import {
  Connection,
  Dimensions,
  Session,
  Stream,
  Subscriber,
  SubscriberProperties,
  initSession,
  Event,
  OTError,
} from '@vonage/client-sdk-video';
import fetchCredentials from '../../api/fetchCredentials';
import createMovingAvgAudioLevelTracker from '../../utils/movingAverageAudioLevelTracker';
import useUserContext from '../../hooks/useUserContext';
import ActiveSpeakerTracker from '../../utils/ActiveSpeakerTracker';
import useRightPanel, { RightPanelActiveTab } from '../../hooks/useRightPanel';
import logOnConnect from '../../utils/logOnConnect';
import useChat from '../../hooks/useChat';
import { SubscriberWrapper } from '../../types/session';
import sortByDisplayPriority from '../../utils/sortByDisplayPriority';
import { ChatMessageType } from '../../types/chat';
import { isMobile } from '../../utils/util';

export type { ChatMessageType } from '../../types/chat';

export type ChangedStreamType = {
  stream: Stream;
  changedProperty: 'hasVideo' | 'hasAudio' | 'videoDimensions';
  newValue: boolean | Dimensions;
  oldValue: boolean | Dimensions;
  token?: string;
};

export type LayoutMode = 'grid' | 'active-speaker';

export type SessionContextType = {
  session: null | Session;
  changedStream: null | ChangedStreamType;
  connections: null | Connection[];
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
  changedStream: null,
  connections: null,
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
 * Represents the credentials required to connect to a session.
 * For Opentok the apiKey is the project Id
 * For Vonage Unified the apiKey is the application Id
 */
export type Credential = {
  apiKey: string;
  sessionId: string;
  token: string;
};
export type StreamCreatedEvent = Event<'streamCreated', Session> & {
  stream: Stream;
};

/**
 * @typedef {object} SessionProviderProps
 * @property {ReactNode} children - The content to be rendered as children.
 */
export type SessionProviderProps = {
  children: ReactNode;
};

const MAX_PIN_COUNT = isMobile() ? 1 : 3;

/**
 * SessionProvider - React Context Provider for SessionProvider
 * Provides session context to the component tree, including managing subscribers, connections, and layout mode.
 * We use Context to make the Session object available in many components across the app without
 * prop drilling: https://react.dev/learn/passing-data-deeply-with-context#use-cases-for-context
 * @param {SessionProviderProps} props - The provider properties
 * @returns {SessionContextType} a context provider for a publisher preview
 */
const SessionProvider = ({ children }: SessionProviderProps): ReactElement => {
  const session = useRef<Session | null>(null);
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

  const handleChatSignal = ({ data }: { data: string }) => {
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
   * Marks a subscriber as pinned, and moves it to the top of the display order.
   * @param {string} id - The ID of the subscriber to pin.
   */
  const pinSubscriber = useCallback(
    (id: string) => {
      setSubscriberWrappers((previousSubscriberWrappers) => {
        const subscriber = previousSubscriberWrappers.find(({ id: streamId }) => streamId === id);
        if (subscriber) {
          const pinnedSubscriber = {
            ...subscriber,
            isPinned: !subscriber.isPinned,
          };
          const subscribers = [
            ...previousSubscriberWrappers.filter(({ id: streamId }) => streamId !== id),
            pinnedSubscriber,
          ].sort(sortByDisplayPriority(activeSpeakerId));
          return subscribers;
        }
        return previousSubscriberWrappers;
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
  const [changedStream, setChangedStream] = useState<ChangedStreamType | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connected, setConnected] = useState(false);

  /**
   * Handles changes to stream properties. This triggers a re-render when a stream property changes
   * @param {ChangedStreamType} params - Object containing details about the changed stream.
   */
  const handleStreamPropertyChanged = ({
    stream,
    changedProperty,
    newValue,
    oldValue,
  }: ChangedStreamType) => {
    setChangedStream({ stream, changedProperty, newValue, oldValue, token: uuid() });
  };

  /**
   * Handles the creation of a new connection. Adding it to the connection array
   * @param {ConnectionEventType} e - The connection event object.
   */
  const handleConnectionCreated = (e: ConnectionEventType) => {
    setConnections((prevConnections) => [...prevConnections, e.connection]);
  };

  /**
   * Handles the destruction of a connection. Removing it from the connections array
   * @param {ConnectionEventType} e - The connection event object.
   */
  const handleConnectionDestroyed = (e: ConnectionEventType) => {
    setConnections((prevConnections) =>
      [...prevConnections].filter(
        (connection) => connection.connectionId !== e.connection.connectionId
      )
    );
  };

  // handle the disconnect from session and clean up of the session object
  const handleSessionDisconnected = () => {
    setConnections([]);
    session.current = null;
    setConnected(false);
  };

  type VideoElementCreatedEvent = Event<'videoElementCreated', Subscriber> & {
    element: HTMLVideoElement | HTMLObjectElement;
  };

  /**
   * Subscribes to a stream in a session, managing the receiving audio and video from the remote party.
   * We are disabling the default SDK UI to have more control on the display of the subscriber
   * Ref for Vonage Unified https://vonage.github.io/conversation-docs/video-js-reference/latest/Session.html#subscribe
   * Ref for Opentok https://tokbox.com/developer/sdks/js/reference/Session.html#subscribe
   * @param {Stream} stream - The stream to which the user is subscribing.
   * @param {Session} localSession - The session in which the stream is located.
   * @param {SubscriberProperties} [options={}] - Optional properties to configure the subscriber.
   * @returns {Promise<void>} A promise that resolves when the subscription is set up.
   */
  const subscribe = useCallback(
    async (stream: Stream, localSession: Session, options: SubscriberProperties = {}) => {
      const { streamId } = stream;
      if (localSession) {
        const finalOptions: SubscriberProperties = {
          ...options,
          insertMode: 'append',
          width: '100%',
          height: '100%',
          preferredResolution: 'auto',
          style: {
            buttonDisplayMode: 'off',
            nameDisplayMode: 'on',
          },
          insertDefaultUI: false,
        };
        const isScreenshare = stream.videoType === 'screen';
        const subscriber = localSession.subscribe(stream, undefined, finalOptions);
        subscriber.on('videoElementCreated', (event: VideoElementCreatedEvent) => {
          const { element } = event;
          const subscriberWrapper: SubscriberWrapper = {
            element,
            subscriber,
            isScreenshare,
            isPinned: false,
            // subscriber.id is refers to the targetElement id and will be undefined when insertDefaultUI is false so we use streamId to track our subscriber
            id: streamId,
          };
          // prepend new subscriber to beginning of array so that is is visible on joining
          setSubscriberWrappers((previousSubscriberWrappers) =>
            [subscriberWrapper, ...previousSubscriberWrappers].sort(
              sortByDisplayPriority(activeSpeakerIdRef.current)
            )
          );
        });

        subscriber.on('destroyed', () => {
          activeSpeakerTracker.current.onSubscriberDestroyed(streamId);
          const isNotDestroyedStreamId = ({ id }: { id: string }) => streamId !== id;
          setSubscriberWrappers((prevSubscriberWrappers) =>
            prevSubscriberWrappers.filter(isNotDestroyedStreamId)
          );
        });

        // Create moving average tracker and add handler for subscriber audioLevelUpdated event emitted periodically with subscriber audio volume
        // See for reference: https://developer.vonage.com/en/video/guides/ui-customization/general-customization#adjusting-user-interface-based-on-audio-levels
        const getMovingAverageAudioLevel = createMovingAvgAudioLevelTracker();
        subscriber.on('audioLevelUpdated', ({ audioLevel }) => {
          const { logMovingAvg } = getMovingAverageAudioLevel(audioLevel);
          activeSpeakerTracker.current.onSubscriberAudioLevelUpdated({
            subscriberId: streamId,
            movingAvg: logMovingAvg,
          });
        });
      }
    },
    []
  );

  // handle the subscription (Receiving media from remote parties)
  const handleStreamCreated = (e: StreamCreatedEvent) => {
    if (session.current) {
      subscribe(e.stream, session.current);
    }
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

  const handleArchiveStarted = ({ id }: { id: string }) => {
    setArchiveId(id);
  };

  const handleArchiveStopped = () => {
    setArchiveId(null);
  };

  /**
   * Connects to the session using the provided credentials.
   * @param {Credential} credential - The credentials for the session.
   * @returns {Promise<void>} A promise that resolves when the session is connected.
   */
  const connect = useCallback(async (credential: Credential) => {
    try {
      const { apiKey, sessionId, token } = credential;
      // initialize the session object and set up the relevant event listeners
      // https://tokbox.com/developer/sdks/js/reference/Session.html#events for opentok
      // https://vonage.github.io/conversation-docs/video-js-reference/latest/Session.html#events for unified environment
      session.current = initSession(apiKey, sessionId);

      session.current.on('streamPropertyChanged', handleStreamPropertyChanged);
      session.current.on('streamCreated', handleStreamCreated);
      session.current.on('sessionReconnecting', handleReconnecting);
      session.current.on('sessionReconnected', handleReconnected);
      session.current.on('sessionDisconnected', handleSessionDisconnected);
      session.current.on('connectionCreated', handleConnectionCreated);
      session.current.on('connectionDestroyed', handleConnectionDestroyed);
      session.current.on('archiveStarted', handleArchiveStarted);
      session.current.on('archiveStopped', handleArchiveStopped);
      // @ts-expect-error signal:<type> is not ts compliant
      session.current.on('signal:chat', handleChatSignal);

      await new Promise<string | undefined>((resolve, reject) => {
        session.current?.connect(token, (err?: OTError) => {
          if (err) {
            // We ignore the following lint warning because we are rejecting with an OTError object.
            reject(err); // NOSONAR
          } else {
            setConnected(true);
            logOnConnect(apiKey, sessionId, session.current?.connection?.connectionId);
            resolve(session.current?.sessionId);
          }
        });
      });
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
      changedStream,
      connections,
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
      changedStream,
      connections,
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
