import { initPublisher } from '@vonage/client-sdk-video';
import { useTranslation } from 'react-i18next';
import { createContext, InferAPI } from 'react-global-state-hooks';
import advancedSettings$ from '@Context/AdvancedSettings';
import { initialState } from './constants';
import useUserContext from '@hooks/useUserContext';
import { UserType } from '@Context/user';
import useSessionContext from '@hooks/useSessionContext';
import { SessionContextType } from '@Context/SessionProvider/session';
import { FC, PropsWithChildren } from 'react';
import {
  applyBitrate,
  handleApplyAdvancedSettingsError,
} from '@Context/PublisherProvider/useApplyAdvancedSettings';
import { attempt } from '@common/execution';
import { isNil } from 'json-storage-formatter';
import resolveScreenSharePreferredVideoCodecs from './helpers/resolveScreenSharePreferredVideoCodecs';

type ScreenShare = InferAPI<typeof screenShare$>;

const screenShare$ = createContext(initialState, {
  metadata: {
    user: {} as UserType,
    session: {} as SessionContextType,
    t: (() => {}) as ReturnType<typeof useTranslation>['t'],
  },
  actions: {
    onScreenShareStopped: function (this: ScreenShare['actions']) {
      return ({ setState }) => {
        setState((state) => ({
          ...state,
          isSharingScreen: false,
          isEntireScreen: false,
          screenshareVideoElement: undefined,
          publisher: null,
        }));
      };
    },

    unpublishScreenshare: () => {
      return ({ getState, metadata, setState }) => {
        const { publisher } = getState();
        if (!publisher) return;

        const { session } = metadata;

        session.unpublish(publisher);

        setState((state) => ({
          ...state,
          isSharingScreen: false,
          isEntireScreen: false,
        }));
      };
    },

    handleStreamCreated: () => {
      return (props) => {
        const actions = props.actions as ScreenShare['actions'];
        actions.unpublishScreenshare();
      };
    },

    toggleShareScreen: () => {
      return async ({ getState, metadata, setState, actions }) => {
        const { user, session, t } = metadata;
        const { vonageVideoClient, publish } = session;
        const actions$ = actions as ScreenShare['actions'];

        if (!vonageVideoClient) return;

        if (!getState().isSharingScreen) {
          // Pre-selecting the screen sharing surface the user chose in Advanced Settings
          const { screenShareSurface } = advancedSettings$.getState();

          const screenShareConstraints = (() => {
            if (screenShareSurface === 'default') return undefined;
            return { video: { displaySurface: screenShareSurface } };
          })();

          // Initializing the publisher for screen sharing
          const {
            screenShareContentHint,
            screenShareCodecMode,
            screenShareCodecPriority,
            scalableScreenshareEnabled,
            screenShareFrameRate,
            screenShareResolution,
            screenShareBitrateMode,
            screenShareCustomVideoBitrate,
            codecMode,
            codecPriority,
          } = advancedSettings$.getState();

          const preferredVideoCodecs = resolveScreenSharePreferredVideoCodecs({
            screenShareCodecMode,
            screenShareCodecPriority,
            codecMode,
            codecPriority,
          });

          const partnerId = session.sessionDetails?.applicationId ?? null;

          const publisher = initPublisher(
            undefined,
            {
              videoSource: 'screen',
              insertDefaultUI: false,
              videoContentHint: screenShareContentHint,
              preferredVideoCodecs,
              scalableScreenshare: scalableScreenshareEnabled,
              ...(!isNil(screenShareFrameRate) && { frameRate: screenShareFrameRate }),
              ...(!isNil(screenShareResolution) && { resolution: screenShareResolution }),
              name: t('participants.screen', { participantName: user.defaultSettings.name }),
              constraints: screenShareConstraints,
            },
            (err) => {
              if (!err) return;

              handleApplyAdvancedSettingsError({
                message: 'Failed to initialize screen share publisher',
                eventSource: 'screenShare$.toggleShareScreen.initPublisher',
                partnerId,
              })(err);

              actions$.onScreenShareStopped();
            }
          );

          setState((state) => ({
            ...state,
            publisher,
          }));

          // Adding class for screen sharing styling
          publisher.element?.classList.add('OT_big');

          // Handling stream creation event
          publisher.on('streamCreated', () => {
            setState((state) => ({
              ...state,
              isSharingScreen: true,
            }));
          });

          publisher.on('videoElementCreated', (e) => {
            const videoEl = e.element as HTMLVideoElement;

            setState((state) => ({
              ...state,
              screenshareVideoElement: videoEl,
            }));

            const mediaStream = videoEl.srcObject as MediaStream | null;
            const track = mediaStream?.getVideoTracks?.()[0];
            const settings = track?.getSettings?.();
            const displaySurface = settings?.displaySurface;

            const width = settings?.width;
            const height = settings?.height;

            const isMonitor =
              displaySurface === 'monitor' ||
              (!displaySurface &&
                width !== undefined &&
                height !== undefined &&
                width * height >= window.screen.width * window.screen.height);

            setState((state) => ({
              ...state,
              isEntireScreen: isMonitor,
            }));
          });

          publisher.on('streamDestroyed', () => {
            actions$.onScreenShareStopped();
          });

          // Handling media stopped event
          publisher.on('mediaStopped', () => {
            actions$.onScreenShareStopped();
          });

          // Publishing the screen sharing stream
          await publish(publisher);

          if (screenShareBitrateMode !== null) {
            await attempt(
              () => applyBitrate(publisher, screenShareBitrateMode, screenShareCustomVideoBitrate),
              handleApplyAdvancedSettingsError({
                message: 'Failed to apply screen share bitrate',
                eventSource: 'screenShare$.toggleShareScreen.applyBitrate',
                partnerId,
              })
            );
          }

          vonageVideoClient?.on('screenshareStreamCreated', actions$.handleStreamCreated);

          return;
        }

        if (getState().publisher) {
          actions$.unpublishScreenshare();
          vonageVideoClient?.off('screenshareStreamCreated', actions$.handleStreamCreated);
        }
      };
    },
  },
});

export default Object.assign(screenShare$, {
  Provider: (() => {
    // Keeps the metadata in sync, executes before the children are rendered
    const Synchronizer: FC<PropsWithChildren> = ({ children }) => {
      const { t } = useTranslation();
      const { user } = useUserContext();
      const session = useSessionContext();
      const { setMetadata } = screenShare$.use.api();

      setMetadata((metadata) => ({
        ...metadata,
        user,
        session,
        t,
      }));

      return children;
    };

    const ScreenShareProvider = screenShare$.Provider;

    const Provider = ({ children, ...props }: Parameters<typeof ScreenShareProvider>[0]) => {
      return (
        <ScreenShareProvider {...props}>
          <Synchronizer>{children}</Synchronizer>
        </ScreenShareProvider>
      );
    };

    const makeProviderWrapper = (
      options?: Parameters<typeof ScreenShareProvider.makeProviderWrapper>[0]
    ) => {
      const { wrapper: Wrapper, ...rest } = ScreenShareProvider.makeProviderWrapper(options);

      return {
        ...rest,
        wrapper: ({ children, ...props }: Parameters<typeof Wrapper>[0]) => (
          <Wrapper {...props}>
            <Synchronizer>{children}</Synchronizer>
          </Wrapper>
        ),
      };
    };

    return Object.assign(Provider, ScreenShareProvider, {
      makeProviderWrapper,
    });
  })(),

  useIsSharingScreen: screenShare$.use.createSelectorHook((state) => state.isSharingScreen),
  useIsEntireScreen: screenShare$.use.createSelectorHook((state) => state.isEntireScreen),
  useScreensharingPublisher: screenShare$.use.createSelectorHook((state) => state.publisher),
  useScreenshareVideoElement: screenShare$.use.createSelectorHook(
    (state) => state.screenshareVideoElement
  ),
});
