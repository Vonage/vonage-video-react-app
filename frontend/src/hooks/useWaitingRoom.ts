import { useState, useEffect, useEffectEvent } from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import usePreviewPublisherContext from './usePreviewPublisherContext';
import useBackgroundPublisherContext from './useBackgroundPublisherContext';
import useSessionKeyParam from './useSessionKeyParam';
import useDecodedSessionKey from './useDecodedSessionKey';
import { getStorageItem, STORAGE_KEYS } from '../utils/storage';
import { DEVICE_ACCESS_STATUS } from '../utils/constants';
import { env } from '../env';

const useWaitingRoom = () => {
  const { sessionKey, sessionKeyStatus } = useSessionKeyParam();

  const { roomName } = useDecodedSessionKey({
    sessionKey,
    sessionKeyStatus,
  });

  const {
    initLocalPublisher,
    publisher,
    accessStatus,
    deniedDevices,
    destroyPublisher,
    isVideoLoading,
  } = usePreviewPublisherContext();

  const { initBackgroundLocalPublisher, publisher: backgroundPublisher } =
    useBackgroundPublisherContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openAudioInput, setOpenAudioInput] = useState<boolean>(false);
  const [openVideoInput, setOpenVideoInput] = useState<boolean>(false);
  const [openAudioOutput, setOpenAudioOutput] = useState<boolean>(false);
  const [username, setUsername] = useState(getStorageItem(STORAGE_KEYS.USERNAME) ?? '');

  const stableInitLocalPublisher = useEffectEvent(() => {
    if (!publisher) {
      initLocalPublisher();
    }

    return () => {
      if (publisher) {
        destroyPublisher();
      }
    };
  });

  useEffect(() => {
    return stableInitLocalPublisher();
  }, [publisher]);

  useEffect(() => {
    if (!backgroundPublisher) {
      initBackgroundLocalPublisher();
    }
  }, [initBackgroundLocalPublisher, backgroundPublisher]);

  // When the user re-grants a previously denied permission the publisher reports ACCESS_CHANGED.
  // Drive the re-init explicitly: tear down any existing (dead) publisher and start a fresh one.
  // Relying on destroy → 'destroyed' → [publisher]-effect is unsafe because after an initial
  // getUserMedia failure the ref is already null, so destroyPublisher() no-ops and the
  // [publisher] dep never changes, leaving the room stuck behind the access-changed alert.
  useEffect(() => {
    if (accessStatus === DEVICE_ACCESS_STATUS.ACCESS_CHANGED) {
      destroyPublisher();
      initLocalPublisher();
    }
  }, [accessStatus, destroyPublisher, initLocalPublisher]);

  const handleAudioInputOpen = (
    event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
    setOpenAudioInput(true);
  };

  const handleVideoInputOpen = (
    event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
    setOpenVideoInput(true);
  };

  const handleAudioOutputOpen = (
    event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
    setOpenAudioOutput(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenAudioInput(false);
    setOpenAudioOutput(false);
    setOpenVideoInput(false);
  };

  // The room is ready to show inline once device access has *settled* — whether granted
  // (ACCEPTED) or blocked (REJECTED). Meet-style, a blocked device no longer hides the room
  // behind a full-screen alert; the preview and controls render with the device badged.
  const hasSettledAccess =
    accessStatus === DEVICE_ACCESS_STATUS.ACCEPTED ||
    accessStatus === DEVICE_ACCESS_STATUS.REJECTED;
  const isRoomReady =
    env.WAITING_ROOM_ALLOW_DEVICE_SELECTION && hasSettledAccess && !isVideoLoading;

  return {
    anchorEl,
    openAudioInput,
    openVideoInput,
    openAudioOutput,
    username,
    setUsername,
    accessStatus,
    deniedDevices,
    isRoomReady,
    roomName,
    sessionKey,
    handleAudioInputOpen,
    handleVideoInputOpen,
    handleAudioOutputOpen,
    handleClose,
  };
};

export default useWaitingRoom;
