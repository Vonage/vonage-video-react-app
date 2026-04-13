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

  const { initLocalPublisher, publisher, accessStatus, destroyPublisher, isVideoLoading } =
    usePreviewPublisherContext();

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

  const isRoomReady =
    env.WAITING_ROOM_ALLOW_DEVICE_SELECTION &&
    accessStatus === DEVICE_ACCESS_STATUS.ACCEPTED &&
    !isVideoLoading;

  return {
    anchorEl,
    openAudioInput,
    openVideoInput,
    openAudioOutput,
    username,
    setUsername,
    accessStatus,
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
