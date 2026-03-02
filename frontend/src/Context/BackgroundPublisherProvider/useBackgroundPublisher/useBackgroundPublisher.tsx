import { useState, useRef, useCallback } from 'react';
import {
  Publisher,
  Event,
  initPublisher,
  VideoFilter,
  hasMediaProcessorSupport,
  PublisherProperties,
} from '@vonage/client-sdk-video';
import usePermissions from '../../../hooks/usePermissions';
import useUserContext from '../../../hooks/useUserContext';
import { DEVICE_ACCESS_STATUS } from '../../../utils/constants';
import { AccessDeniedEvent } from '../../PublisherProvider/usePublisher/usePublisher';
import applyBackgroundFilter from '../../../utils/backgroundFilter/applyBackgroundFilter/applyBackgroundFilter';
import useImageStorage, { StoredImage } from '../../../utils/useImageStorage/useImageStorage';
import getInitialBackgroundFilter from '../../../utils/backgroundFilter/getInitialBackgroundFilter/getInitialBackgroundFilter';
import handlePublisherAccessDenied from '../../../utils/publisher/handlePublisherAccessDenied';
import mediaDevices$ from '@core/stores/devices';
import useSyncPublisherDevices from '@Context/PublisherProvider/usePublisher/hooks/useSyncPublisherDevices';
import { getStorageItem, STORAGE_KEYS } from '@utils/storage';
import attempt from '@common/execution/attempt/attempt';
import { useMountEffect } from '@web/hooks';

export type BackgroundPublisherContextType = {
  isPublishing: boolean;
  isVideoEnabled: boolean;
  publisher: Publisher | null;
  publisherVideoElement: HTMLVideoElement | HTMLObjectElement | undefined;
  destroyBackgroundPublisher: () => void;
  toggleVideo: () => void;
  changeBackground: (backgroundSelected: string) => Promise<void>;
  backgroundFilter: VideoFilter | undefined;
  localVideoSource: string | undefined;
  accessStatus: string | null;
  changeVideoSource: (deviceId: string) => void;
  initBackgroundLocalPublisher: () => void;
  customImages: StoredImage[];
  addCustomImage: (dataUrl: string) => void;
  deleteCustomImage: (id: string) => void;
  backgroundSelected: string;
  setBackgroundSelected: (value: string) => void;
  handleBackgroundChange: (background: string) => void;
  handleAddCustomImage: (dataUrl: string) => void;
};

type PublisherVideoElementCreatedEvent = Event<'videoElementCreated', Publisher> & {
  element: HTMLVideoElement | HTMLObjectElement;
};

export type BackgroundPublisherContextInitialValue = Partial<
  Pick<
    BackgroundPublisherContextType,
    | 'localVideoSource'
    | 'publisherVideoElement'
    | 'isPublishing'
    | 'isVideoEnabled'
    | 'customImages'
    | 'backgroundSelected'
    | 'backgroundFilter'
    | 'publisher'
  >
>;

/**
 * Hook wrapper for creation, interaction with, and state for local video publisher with background effects.
 * Access from app via BackgroundPublisherProvider, not directly.
 * @property {boolean} isPublishing - React state boolean showing if we are publishing
 * @property {boolean} isVideoEnabled - React state boolean showing if camera is on
 * @property {Publisher | null} publisher - Publisher object
 * @property {HTMLVideoElement | HTMLObjectElement} publisherVideoElement - video element for publisher
 * @property {Function} destroyBackgroundPublisher - Method to destroy publisher
 * @property {Function} toggleVideo - Method to toggle camera on/off. State updated internally, can be read via isVideoEnabled.
 * @property {Function} changeBackground - Method to change background effect
 * @property {VideoFilter | undefined} backgroundFilter - Current background filter applied to publisher
 * @property {string | undefined} localVideoSource - Current video source device ID
 * @property {string | null} accessStatus - Current device access status
 * @property {Function} changeVideoSource - Method to change video source device ID
 * @property {Function} initBackgroundLocalPublisher - Method to initialize the background publisher
 * @returns {BackgroundPublisherContextType} Background context
 */
const useBackgroundPublisher = (
  initialValue?: BackgroundPublisherContextInitialValue
): BackgroundPublisherContextType => {
  const { user } = useUserContext();
  const { getImagesFromStorage, addImageToStorage, deleteImageFromStorage } = useImageStorage();
  const [publisherVideoElement, setPublisherVideoElement] = useState<
    HTMLVideoElement | HTMLObjectElement | undefined
  >(initialValue?.publisherVideoElement ?? undefined);
  const { setAccessStatus, accessStatus } = usePermissions();

  const backgroundPublisherRef = useRef<Publisher | null>(null);
  const [isPublishing, setIsPublishing] = useState<boolean>(initialValue?.isPublishing ?? false);

  const initialBackgroundRef = useRef<VideoFilter | undefined>(
    user.defaultSettings.backgroundFilter
  );

  const [backgroundFilter, setBackgroundFilter] = useState<VideoFilter | undefined>(
    () => initialValue?.backgroundFilter ?? user.defaultSettings.backgroundFilter
  );

  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(
    initialValue?.isVideoEnabled ?? getStorageItem(STORAGE_KEYS.VIDEO_SOURCE_ENABLED) !== 'false'
  );

  const [localVideoSource, setLocalVideoSource] = useState<string | undefined>(
    initialValue?.localVideoSource ?? undefined
  );

  const [customImages, setCustomImages] = useState<StoredImage[]>(
    () => initialValue?.customImages ?? getImagesFromStorage()
  );

  const [backgroundSelected, setBackgroundSelected] = useState<string>(
    initialValue?.backgroundSelected ?? ''
  );

  const handleBackgroundDestroyed = () => {
    backgroundPublisherRef.current = null;
  };

  // Sync publisher with selected devices from store (handles device changes and disconnections)
  useSyncPublisherDevices(backgroundPublisherRef, { setIsVideoEnabled });

  /**
   * Change background replacement or blur effect
   * @param {string} backgroundSelected - The selected background option
   * @returns {void}
   */
  const changeBackground = useCallback(
    (backgroundSelected: string) => {
      return applyBackgroundFilter({
        publisher: backgroundPublisherRef.current,
        backgroundSelected,
        setUser: undefined,
        setBackgroundFilter,
        storeItem: false,
      }).catch(() => {
        console.error('Failed to apply background filter.');
      });
    },
    [setBackgroundFilter]
  );

  /**
   * Change video camera in use
   * @returns {void}
   */
  const changeVideoSource = useCallback((deviceId: string) => {
    if (!deviceId || !backgroundPublisherRef.current) {
      return;
    }
    void backgroundPublisherRef.current.setVideoSource(deviceId);
    setLocalVideoSource(deviceId);
  }, []);

  const handleBackgroundAccessDenied = useCallback(
    async (event: AccessDeniedEvent) => {
      await handlePublisherAccessDenied(event, setAccessStatus);
    },
    [setAccessStatus]
  );

  const handleVideoElementCreated = (event: PublisherVideoElementCreatedEvent) => {
    setPublisherVideoElement(event.element);
    setIsPublishing(true);
  };

  const addPublisherListeners = useCallback(
    (publisher: Publisher | null) => {
      if (!publisher) {
        return;
      }
      publisher.on('destroyed', handleBackgroundDestroyed);
      publisher.on('accessDenied', handleBackgroundAccessDenied);
      publisher.on('videoElementCreated', handleVideoElementCreated);
      publisher.on('accessAllowed', () => {
        setAccessStatus(DEVICE_ACCESS_STATUS.ACCEPTED);
      });
    },
    [handleBackgroundAccessDenied, setAccessStatus]
  );

  /**
   * Destroys the background publisher
   * @returns {void}
   */
  const destroyBackgroundPublisher = useCallback(() => {
    attempt(() => {
      backgroundPublisherRef.current?.destroy();
    });

    backgroundPublisherRef.current = null;
  }, []);

  const initBackgroundLocalPublisher = useCallback(() => {
    if (backgroundPublisherRef.current) return;

    // Set videoFilter based on user's selected background
    let videoFilter: VideoFilter | undefined;
    if (initialBackgroundRef.current && hasMediaProcessorSupport()) {
      videoFilter = initialBackgroundRef.current;
    }

    const publisherOptions: PublisherProperties = {
      insertDefaultUI: false,
      videoFilter,
      resolution: '1280x720',
      videoSource: mediaDevices$.getState().videoinput,
      publishAudio: false,
      publishVideo: isVideoEnabled,
    };

    backgroundPublisherRef.current = initPublisher(undefined, publisherOptions, (err: unknown) => {
      if (err instanceof Error) {
        backgroundPublisherRef.current = null;
        if (err.name === 'OT_USER_MEDIA_ACCESS_DENIED') {
          console.error('initPublisher error: ', err);
        }
      }
    });
    addPublisherListeners(backgroundPublisherRef.current);
  }, [addPublisherListeners, isVideoEnabled]);

  /**
   * Turns the camera on and off
   * A wrapper for Publisher.publishVideo()
   * More details here: https://vonage.github.io/conversation-docs/video-js-reference/latest/Publisher.html#publishVideo
   * @returns {void}
   */
  const toggleVideo = () => {
    if (!backgroundPublisherRef.current) {
      return;
    }
    backgroundPublisherRef.current.publishVideo(!isVideoEnabled);
    setIsVideoEnabled(!isVideoEnabled);
  };

  /**
   * Add a custom background image
   * @param {string} dataUrl - The data URL of the image to add
   * @returns {void}
   */
  const addCustomImage = useCallback(
    (dataUrl: string) => {
      addImageToStorage(dataUrl);
      setCustomImages(getImagesFromStorage());
    },
    [getImagesFromStorage, addImageToStorage]
  );

  /**
   * Delete a custom background image
   * If the deleted image is currently selected, clear the background filter
   * @param {string} id - The ID of the image to delete
   * @returns {void}
   */
  const deleteCustomImage = useCallback(
    (id: string) => {
      const imageToDelete = customImages.find((img) => img.id === id);
      if (!imageToDelete) {
        throw new Error('Image to delete not found');
      }

      // Don't allow deletion if this image is currently selected
      const isSelectedBackground = backgroundSelected === imageToDelete.dataUrl;
      if (isSelectedBackground) {
        throw new Error('Cannot delete currently selected background image');
      }

      deleteImageFromStorage(id);
      setCustomImages((imgs) => imgs.filter((img) => img.id !== id));

      // If the deleted image was the currently applied background filter, clear it
      const currentBackgroundFilter = getInitialBackgroundFilter(backgroundPublisherRef.current);
      if (imageToDelete.dataUrl === currentBackgroundFilter) {
        changeBackground(backgroundSelected).catch(() => {
          throw new Error('Failed to reset background filter after deleting custom image');
        });
      }
    },
    [backgroundSelected, customImages, deleteImageFromStorage, changeBackground]
  );

  /**
   * Handle background change by updating state and applying the filter
   * @param {string} background - The background option to apply
   * @returns {void}
   */
  const handleBackgroundChange = useCallback(
    (background: string) => {
      setBackgroundSelected(background);
      changeBackground(background).catch((error) => {
        console.error('Failed to change background:', error);
      });
    },
    [changeBackground]
  );

  /**
   * Handle adding a custom image and immediately apply it as background
   * @param {string} dataUrl - The data URL of the image to add
   * @returns {void}
   */
  const handleAddCustomImage = useCallback(
    (dataUrl: string) => {
      addCustomImage(dataUrl);
      handleBackgroundChange(dataUrl);
    },
    [addCustomImage, handleBackgroundChange]
  );

  useMountEffect(() => {
    return () => {
      destroyBackgroundPublisher();
    };
  });

  return {
    initBackgroundLocalPublisher,
    isPublishing,
    isVideoEnabled,
    destroyBackgroundPublisher,

    publisher: backgroundPublisherRef.current,
    publisherVideoElement,
    toggleVideo,
    changeBackground,
    backgroundFilter,
    changeVideoSource,
    localVideoSource,
    accessStatus,

    customImages,
    addCustomImage,
    deleteCustomImage,
    backgroundSelected,
    setBackgroundSelected,
    handleBackgroundChange,
    handleAddCustomImage,
  };
};
export default useBackgroundPublisher;
