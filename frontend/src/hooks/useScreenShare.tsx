import { useState, useRef, useCallback } from 'react';
import { Publisher, initPublisher } from '@vonage/client-sdk-video';
import { useTranslation } from 'react-i18next';
import useSessionContext from './useSessionContext';
import useUserContext from './useUserContext';

/**
 * @typedef {object} UseScreenShareType
 * @property {() => void} toggleScreenShare - Function that starts and stop screen sharing
 * @property {boolean} isSharingScreen - Indicates whether you are sharing your screen or not
 */
export type UseScreenShareType = {
  toggleShareScreen: () => Promise<void>;
  isSharingScreen: boolean;
  isEntireScreen: boolean;
  screensharingPublisher: Publisher | null;
  screenshareVideoElement: HTMLVideoElement | HTMLObjectElement | undefined;
};

/**
 * Hook for toggling screen share and getting the current local screen share status (sharing / not sharing)
 * @returns {UseScreenShareType} useScreenShare
 */
const useScreenShare = (): UseScreenShareType => {
  const { t } = useTranslation();
  const { vonageVideoClient, unpublish, publish } = useSessionContext();
  const { user } = useUserContext();

  // Using useRef to store the screen sharing publisher instance
  const screenSharingPubRef = useRef<Publisher | null>(null);

  // State to track sharing status
  const [isSharingScreen, setIsSharingScreen] = useState<boolean>(false);
  const [isEntireScreen, setIsEntireScreen] = useState<boolean>(false);
  const [screenshareVideoElement, setScreenshareVideoElement] = useState<
    HTMLVideoElement | HTMLObjectElement
  >();

  const onScreenShareStopped = useCallback(() => {
    setIsSharingScreen(false);
    setIsEntireScreen(false);
    setScreenshareVideoElement(undefined);
    screenSharingPubRef.current = null;
  }, []);

  const unpublishScreenshare = useCallback(() => {
    if (screenSharingPubRef.current) {
      unpublish(screenSharingPubRef.current);
      setIsSharingScreen(false);
      setIsEntireScreen(false);
    }
  }, [unpublish]);

  const handleStreamCreated = useCallback(() => {
    unpublishScreenshare();
  }, [unpublishScreenshare]);

  // Using useCallback to memoize the function to avoid unnecessary re-renders
  const toggleShareScreen = useCallback(async () => {
    if (vonageVideoClient) {
      if (!isSharingScreen) {
        // Initializing the publisher for screen sharing
        screenSharingPubRef.current = initPublisher(
          undefined,
          {
            videoSource: 'screen',
            insertDefaultUI: false,
            videoContentHint: 'detail',
            name: t('participants.screen', { participantName: user.defaultSettings.name }),
          },
          (err) => {
            if (err) {
              onScreenShareStopped();
            }
          }
        );

        // Adding class for screen sharing styling
        screenSharingPubRef.current?.element?.classList.add('OT_big');

        // Handling stream creation event
        screenSharingPubRef.current?.on('streamCreated', () => {
          setIsSharingScreen(true);
        });

        screenSharingPubRef.current?.on('videoElementCreated', (e) => {
          const videoEl = e.element as HTMLVideoElement;
          setScreenshareVideoElement(videoEl);
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

          setIsEntireScreen(isMonitor);
        });

        screenSharingPubRef.current?.on('streamDestroyed', () => {
          onScreenShareStopped();
        });

        // Handling media stopped event
        screenSharingPubRef.current?.on('mediaStopped', () => {
          onScreenShareStopped();
        });

        // Publishing the screen sharing stream
        await publish(screenSharingPubRef.current);

        vonageVideoClient?.on('screenshareStreamCreated', handleStreamCreated);
      } else if (screenSharingPubRef.current) {
        unpublishScreenshare();
        vonageVideoClient?.off('screenshareStreamCreated', handleStreamCreated);
      }
    }
  }, [
    vonageVideoClient,
    isSharingScreen,
    user.defaultSettings.name,
    handleStreamCreated,
    unpublishScreenshare,
    onScreenShareStopped,
    publish,
    t,
  ]);

  return {
    toggleShareScreen,
    isSharingScreen,
    isEntireScreen,
    screenshareVideoElement,
    /**
     * On the first render this will return null
     */

    screensharingPublisher: screenSharingPubRef.current,
  };
};

export default useScreenShare;
