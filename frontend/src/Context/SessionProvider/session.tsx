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
import { Connection, Publisher, Stream } from '@vonage/client-sdk-video';
import useRightPanel, { RightPanelActiveTab } from '@hooks/useRightPanel';
import useUserContext from '@hooks/useUserContext';
import useChat from '@hooks/useChat';
import useEmoji, { EmojiWrapper } from '@hooks/useEmoji';
import fetchCredentials from '@api/fetchCredentials';
import ActiveSpeakerTracker from '@utils/ActiveSpeakerTracker';
import {
  Credential,
  LocalCaptionReceived,
  SignalEvent,
  StreamPropertyChangedEvent,
  SubscriberAudioLevelUpdatedEvent,
  SubscriberWrapper,
  LayoutMode,
  LAYOUT_MODES,
} from '@app-types/session';
import { ChatMessageType } from '@app-types/chat';
import { isMobile } from '@web/platform';
import {
  sortByDisplayPriority,
  togglePinAndSortByDisplayOrder,
} from '@utils/sessionStateOperations';
import { MAX_PIN_COUNT_DESKTOP, MAX_PIN_COUNT_MOBILE } from '@utils/constants';
import VonageVideoClient from '@utils/VonageVideoClient';
import wait from '@common/execution/wait';
import { env } from '../../env';
import frontendLogger from '../../logger';

export type { ChatMessageType } from '@app-types/chat';

export type SessionContextType = {
  vonageVideoClient: null | VonageVideoClient;
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
  archiveIdStartedBySelf: string | null;
  recordingAlreadyNotified: boolean;
  setRecordingAlreadyNotified: Dispatch<SetStateAction<boolean>>;
  markArchiveStartRequestedBySelf: () => void;
  resetArchiveStartRequestedBySelf: () => void;
  rightPanelActiveTab: RightPanelActiveTab;
  toggleParticipantList: () => void;
  toggleBackgroundEffects: () => void;
  toggleChat: () => void;
  closeRightPanel: () => void;
  toggleReportIssue: () => void;
  pinSubscriber: (subscriberId: string) => void;
  isMaxPinned: boolean;
  ownCaptions: string | null;
  sendEmoji: (emoji: string) => void;
  emojiQueue: EmojiWrapper[];
  publish: (publisher: Publisher) => Promise<void>;
  unpublish: (publisher: Publisher) => void;
  lastStreamUpdate: StreamPropertyChangedEvent | null;
  subscriptionError: Error | null;
};

/**
 * Context to provide session-related data and actions.
 */
export const SessionContext = createContext<SessionContextType>({
  vonageVideoClient: null,
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
  archiveIdStartedBySelf: null,
  recordingAlreadyNotified: false,
  setRecordingAlreadyNotified: () => {},
  markArchiveStartRequestedBySelf: () => {},
  resetArchiveStartRequestedBySelf: () => {},
  rightPanelActiveTab: 'closed',
  toggleParticipantList: () => {},
  toggleBackgroundEffects: () => {},
  toggleChat: () => {},
  closeRightPanel: () => {},
  toggleReportIssue: () => {},
  pinSubscriber: () => {},
  isMaxPinned: false,
  ownCaptions: null,
  sendEmoji: () => {},
  emojiQueue: [],
  publish: async () => Promise.resolve(),
  unpublish: () => {},
  lastStreamUpdate: null,
  subscriptionError: null,
});

export type ConnectionEventType = { connection: Connection; reason?: string; id?: string };

export type SessionContextInitialValue = Partial<
  Pick<
    SessionContextType,
    | 'connected'
    | 'reconnecting'
    | 'layoutMode'
    | 'subscriberWrappers'
    | 'lastStreamUpdate'
    | 'subscriptionError'
    | 'ownCaptions'
    | 'archiveId'
    | 'activeSpeakerId'
    | 'recordingAlreadyNotified'
    | 'archiveIdStartedBySelf'
  >
>;

/**
 * @typedef {object} SessionProviderProps
 * @property {ReactNode} children - The content to be rendered as children.
 * @property {SessionContextInitialValue} initialValue - Optional initial values for session context state.
 */
export type SessionProviderProps = {
  children: ReactNode;
  initialValue?: SessionContextInitialValue;
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
const SessionProvider = ({ children, initialValue = {} }: SessionProviderProps): ReactElement => {
  const [lastStreamUpdate, setLastStreamUpdate] = useState<StreamPropertyChangedEvent | null>(
    initialValue?.lastStreamUpdate ?? null
  );
  const vonageVideoClient = useRef<null | VonageVideoClient>(null);
  const [reconnecting, setReconnecting] = useState(initialValue?.reconnecting ?? false);
  const [subscriberWrappers, setSubscriberWrappers] = useState<SubscriberWrapper[]>(
    initialValue?.subscriberWrappers ?? []
  );
  const [subscriptionError, setSubscriptionError] = useState<Error | null>(
    initialValue?.subscriptionError ?? null
  );
  const [ownCaptions, setOwnCaptions] = useState<string | null>(initialValue?.ownCaptions ?? null);

  const [layoutMode, setLayoutMode] = useState<LayoutMode>(
    initialValue?.layoutMode ??
      (() => {
        const isValidLayoutMode = (LAYOUT_MODES as readonly string[]).includes(
          env.DEFAULT_LAYOUT_MODE
        );
        return isValidLayoutMode ? env.DEFAULT_LAYOUT_MODE : 'grid';
      })()
  );

  const [archiveId, setArchiveId] = useState<string | null>(initialValue?.archiveId ?? null);
  const [archiveIdStartedBySelf, setArchiveIdStartedBySelf] = useState<string | null>(
    initialValue?.archiveIdStartedBySelf ?? null
  );
  const [recordingAlreadyNotified, setRecordingAlreadyNotified] = useState<boolean>(
    initialValue?.recordingAlreadyNotified ?? false
  );
  const archiveStartRequestedBySelfRef = useRef<boolean>(false);

  const markArchiveStartRequestedBySelf = useCallback(() => {
    archiveStartRequestedBySelfRef.current = true;
  }, []);

  const resetArchiveStartRequestedBySelf = useCallback(() => {
    archiveStartRequestedBySelfRef.current = false;
  }, []);
  const activeSpeakerTracker = useRef<ActiveSpeakerTracker>(new ActiveSpeakerTracker());
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | undefined>(
    initialValue?.activeSpeakerId ?? undefined
  );
  const activeSpeakerIdRef = useRef<string | undefined>(undefined);
  const { messages, onChatMessage, sendChatMessage } = useChat({
    signal: vonageVideoClient.current?.signal,
  });
  const getConnectionId = useCallback((): string | undefined => {
    return vonageVideoClient.current?.connectionId;
  }, []);
  const { sendEmoji, onEmoji, emojiQueue } = useEmoji({
    signal: vonageVideoClient.current?.signal,
    getConnectionId,
  });
  const {
    closeRightPanel,
    toggleParticipantList,
    toggleBackgroundEffects,
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

  const handleEmoji = useCallback(
    (emojiEvent: SignalEvent) => {
      setSubscriberWrappers((currentSubscriberWrappers) => {
        onEmoji(emojiEvent, currentSubscriberWrappers);
        return [...currentSubscriberWrappers]; // Return unchanged state
      });
    },
    [onEmoji]
  );

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
  const [connected, setConnected] = useState(initialValue?.connected ?? false);

  /**
   * Handles changes to stream properties. This triggers a re-render when a stream property changes
   * @param {StreamPropertyChangedEvent} event - The event containing the stream, changed property, new value, and old value.
   */
  const handleStreamPropertyChanged = (event: StreamPropertyChangedEvent) => {
    const { stream, changedProperty, newValue, oldValue } = event;
    // Without a re-render during a stream change, we don't get visual indicators for a subscriber
    // muting themselves or the initials being displayed.
    setLastStreamUpdate({ stream, changedProperty, newValue, oldValue });
  };

  // handle the disconnect from session and clean up of the session object
  const handleSessionDisconnected = () => {
    vonageVideoClient.current = null;
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
    setSubscriptionError(null);
  };

  const handleArchiveStarted = (id: string) => {
    setArchiveId(id);

    if (!archiveStartRequestedBySelfRef.current) {
      return;
    }

    setArchiveIdStartedBySelf(id);
    archiveStartRequestedBySelfRef.current = false;
  };

  const handleArchiveStopped = () => {
    setArchiveId(null);
    setArchiveIdStartedBySelf(null);
    archiveStartRequestedBySelfRef.current = false;
  };

  const handleSubscriberVideoElementCreated = (subscriberWrapper: SubscriberWrapper) => {
    setSubscriberWrappers((previousSubscriberWrappers) =>
      [
        subscriberWrapper,
        ...previousSubscriberWrappers.filter(({ id }) => id !== subscriberWrapper.id),
      ].toSorted(sortByDisplayPriority(activeSpeakerIdRef.current))
    );
  };

  const handleLocalCaptionReceived = (event: LocalCaptionReceived) => {
    setOwnCaptions(event.caption);
  };

  const handleSubscriberDestroyed = async (streamId: string) => {
    await wait(500);

    const doesStreamStillExistInSession = (() => {
      if (!vonageVideoClient.current) {
        return false;
      }

      return vonageVideoClient.current.hasStream(streamId);
    })();

    console.warn(`Subscriber with stream ID ${streamId} destroyed`, {
      doesStreamStillExistInSession,
    });

    if (doesStreamStillExistInSession) {
      void vonageVideoClient.current!.resubscribeToStreamId(streamId);
      console.warn(`Subscriber with stream ID ${streamId} resubscribing`);
      return;
    }
    destroySubscriber(streamId);
  };

  function destroySubscriber(streamId: string) {
    activeSpeakerTracker.current.onSubscriberDestroyed(streamId);
    const isNotDestroyedStreamId = ({ id }: { id: string }) => streamId !== id;
    setSubscriberWrappers((prevSubscriberWrappers) =>
      prevSubscriberWrappers.filter(isNotDestroyedStreamId)
    );
    console.warn(`Subscriber stream ID ${streamId} destroyed and cleaned up`);
  }

  const handleSubscriberAudioLevelUpdated = ({
    movingAvg,
    subscriberId,
  }: SubscriberAudioLevelUpdatedEvent) => {
    activeSpeakerTracker.current.onSubscriberAudioLevelUpdated({ subscriberId, movingAvg });
  };

  const handleSubscriptionError = useCallback(
    (error: unknown) => {
      const isBrowserOnline = (() => {
        if (typeof navigator === 'undefined') return true;
        return navigator.onLine;
      })();

      if (reconnecting || isBrowserOnline === false) {
        frontendLogger.log('Session: ignoring subscription error during reconnection/offline', {
          reconnecting,
          isBrowserOnline,
        });
        return;
      }

      setSubscriptionError(
        error instanceof Error ? error : new Error('Unknown subscription error')
      );
    },
    [reconnecting]
  );

  /**
   * Connects to the session using the provided credentials.
   * @param {Credential} credential - The credentials for the session.
   * @returns {Promise<void>} A promise that resolves when the session is connected.
   */
  const connect = useCallback(async (credential: Credential) => {
    if (vonageVideoClient.current) {
      return;
    }
    try {
      // initialize the session object and set up the relevant event listeners
      // https://tokbox.com/developer/sdks/js/reference/Session.html#events for opentok
      // https://vonage.github.io/conversation-docs/video-js-reference/latest/Session.html#events for unified environment
      vonageVideoClient.current = new VonageVideoClient(credential);
      vonageVideoClient.current.on('streamPropertyChanged', handleStreamPropertyChanged);
      vonageVideoClient.current.on('sessionReconnecting', handleReconnecting);
      vonageVideoClient.current.on('sessionReconnected', handleReconnected);
      vonageVideoClient.current.on('sessionDisconnected', handleSessionDisconnected);
      vonageVideoClient.current.on('archiveStarted', handleArchiveStarted);
      vonageVideoClient.current.on('archiveStopped', handleArchiveStopped);
      vonageVideoClient.current.on('signal:chat', handleChatSignal);
      vonageVideoClient.current.on('signal:emoji', handleEmoji);
      vonageVideoClient.current.on(
        'subscriberAudioLevelUpdated',
        handleSubscriberAudioLevelUpdated
      );
      vonageVideoClient.current.on(
        'subscriberVideoElementCreated',
        handleSubscriberVideoElementCreated
      );
      vonageVideoClient.current.on('subscriberDestroyed', handleSubscriberDestroyed);
      vonageVideoClient.current.on('localCaptionReceived', handleLocalCaptionReceived);
      vonageVideoClient.current.on('subscriptionError', handleSubscriptionError);

      await vonageVideoClient.current.connect();
      setConnected(true);
    } catch (err: unknown) {
      console.error(err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Joins a room by fetching the necessary credentials and connecting to the session.
   * @param {string} roomName - The name of the room to join.
   */
  const joinRoom = useCallback(
    (roomName: string) => {
      return fetchCredentials(roomName)
        .then((credentials) => {
          return connect(credentials.data);
        })
        .catch(console.warn);
    },
    [connect]
  );

  /**
   * Disconnects from the current session and cleans up session-related resources.
   */
  const disconnect = useCallback(() => {
    if (vonageVideoClient.current) {
      vonageVideoClient.current.disconnect();
      vonageVideoClient.current = null;

      setConnected(false);
    }
  }, []);

  /**
   * Force mutes a participant.
   * @param {Stream} stream - The stream that is going to be muted.
   */
  const forceMute = useCallback(async (stream: Stream) => {
    if (vonageVideoClient.current) {
      await vonageVideoClient.current.forceMuteStream(stream);
    }
  }, []);

  /**
   * Publishes a stream to the session.
   * @param {Publisher} publisher - The publisher object representing the stream to be published.
   * @returns {Promise<void>} A promise that resolves when the stream is successfully published.
   */
  const publish = useCallback(async (publisher: Publisher): Promise<void> => {
    if (!vonageVideoClient.current) {
      return;
    }
    await vonageVideoClient.current.publish(publisher);
  }, []);

  /**
   * Unpublishes a stream from the session.
   * @param {Publisher} publisher - The publisher object representing the stream to be unpublished.
   */
  const unpublish = useCallback(
    (publisher: Publisher) => {
      if (vonageVideoClient.current) {
        vonageVideoClient.current.unpublish(publisher);
      }
    },
    [vonageVideoClient]
  );

  const value = useMemo(
    () => ({
      activeSpeakerId,
      archiveId,
      archiveIdStartedBySelf,
      markArchiveStartRequestedBySelf,
      resetArchiveStartRequestedBySelf,
      vonageVideoClient: vonageVideoClient.current,
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
      recordingAlreadyNotified,
      setRecordingAlreadyNotified,
      setLayoutMode,
      rightPanelActiveTab,
      toggleParticipantList,
      toggleBackgroundEffects,
      toggleChat,
      closeRightPanel,
      toggleReportIssue,
      pinSubscriber,
      isMaxPinned,
      ownCaptions,
      sendEmoji,
      emojiQueue,
      publish,
      unpublish,
      lastStreamUpdate,
      subscriptionError,
    }),
    [
      activeSpeakerId,
      archiveId,
      archiveIdStartedBySelf,
      markArchiveStartRequestedBySelf,
      resetArchiveStartRequestedBySelf,
      setRecordingAlreadyNotified,
      recordingAlreadyNotified,
      vonageVideoClient,
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
      toggleBackgroundEffects,
      toggleChat,
      closeRightPanel,
      toggleReportIssue,
      pinSubscriber,
      isMaxPinned,
      ownCaptions,
      sendEmoji,
      emojiQueue,
      publish,
      unpublish,
      lastStreamUpdate,
      subscriptionError,
    ]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};
export default SessionProvider;
