import { useState, useRef, useCallback } from 'react';
import { initPublisher, type Publisher, type VideoContentHint } from '@vonage/client-sdk-video';
import { useTranslation } from 'react-i18next';
import useSessionContext from './useSessionContext';
import useUserContext from './useUserContext';

/**
 * @typedef {object} UseScreenShareType
 * @property {(contentHint?: VideoContentHint) => Promise<void>} toggleShareScreen - Function that starts and stops screen sharing
 * @property {boolean} isSharingScreen - Indicates whether you are sharing your screen or not
 * @property {(hint: VideoContentHint) => void} changeContentHint - Updates the videoContentHint on the live screen share publisher
 * @property {VideoContentHint} currentContentHint - The currently active videoContentHint for the screen share publisher
 */
export type UseScreenShareType = {
  toggleShareScreen: (contentHint?: VideoContentHint) => Promise<void>;
  isSharingScreen: boolean;
  screensharingPublisher: Publisher | null;
  screenshareVideoElement: HTMLVideoElement | HTMLObjectElement | undefined;
  changeContentHint: (hint: VideoContentHint) => void;
  currentContentHint: VideoContentHint;
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
  const [screenshareVideoElement, setScreenshareVideoElement] = useState<
    HTMLVideoElement | HTMLObjectElement
  >();
  const [currentContentHint, setCurrentContentHint] = useState<VideoContentHint>('');

  const onScreenShareStopped = useCallback(() => {
    setIsSharingScreen(false);
    setScreenshareVideoElement(undefined);
    setCurrentContentHint('');
    screenSharingPubRef.current = null;
  }, []);

  const unpublishScreenshare = useCallback(() => {
    if (screenSharingPubRef.current) {
      unpublish(screenSharingPubRef.current);
      setIsSharingScreen(false);
    }
  }, [unpublish]);

  const handleStreamCreated = useCallback(() => {
    unpublishScreenshare();
  }, [unpublishScreenshare]);

  /**
   * Updates the videoContentHint on the currently active screen share publisher.
   * This allows changing the optimization mode on the fly without republishing.
   * @param {VideoContentHint} hint - The new content hint to apply
   * @see {@link https://developer.vonage.com/en/video/guides/streams/publish-settings#video-content-hints} Vonage — Publish settings: Video content hints
   * @see {@link https://www.w3.org/TR/mst-content-hint/#video-content-hints} W3C — MediaStreamTrack Content Hints: Video content hints
   */
  const changeContentHint = useCallback((hint: VideoContentHint) => {
    screenSharingPubRef.current?.setVideoContentHint(hint);
    setCurrentContentHint(hint);
  }, []);

  // Using useCallback to memoize the function to avoid unnecessary re-renders
  const toggleShareScreen = useCallback(
    async (contentHint: VideoContentHint = 'detail') => {
      if (vonageVideoClient) {
        if (!isSharingScreen) {
          // Initializing the publisher for screen sharing.
          // videoContentHint sets the initial optimization mode for the screen share track.
          // @see {@link https://developer.vonage.com/en/video/guides/streams/publish-settings#video-content-hints} Vonage — Publish settings: Video content hints
          // @see {@link https://www.w3.org/TR/mst-content-hint/#video-content-hints} W3C — MediaStreamTrack Content Hints: Video content hints
          screenSharingPubRef.current = initPublisher(
            undefined,
            {
              videoSource: 'screen',
              insertDefaultUI: false,
              videoContentHint: contentHint,
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
            setCurrentContentHint(contentHint);
          });

          screenSharingPubRef.current?.on('videoElementCreated', (e) => {
            setScreenshareVideoElement(e.element);
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
    },
    [
      vonageVideoClient,
      isSharingScreen,
      user.defaultSettings.name,
      handleStreamCreated,
      unpublishScreenshare,
      onScreenShareStopped,
      publish,
      t,
    ]
  );

  return {
    toggleShareScreen,
    isSharingScreen,
    screenshareVideoElement,
    /**
     * On the first render this will return null
     */
    screensharingPublisher: screenSharingPubRef.current,
    changeContentHint,
    currentContentHint,
  };
};

export default useScreenShare;
