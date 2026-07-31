import { useState, useEffect, useRef, useEffectEvent } from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import useAttemptSignatureGuard from './useAttemptSignatureGuard';
import usePreviewPublisherContext from './usePreviewPublisherContext';
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
    isPublishing,
    isAcquiring,
    accessStatus,
    deniedDevices,
    destroyPublisher,
    isVideoLoading,
  } = usePreviewPublisherContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openAudioInput, setOpenAudioInput] = useState<boolean>(false);
  const [openVideoInput, setOpenVideoInput] = useState<boolean>(false);
  const [openAudioOutput, setOpenAudioOutput] = useState<boolean>(false);
  const [username, setUsername] = useState(getStorageItem(STORAGE_KEYS.USERNAME) ?? '');

  // Don't auto re-init the preview with the identical requested-device set that just failed (the
  // publisher null↔object churn would otherwise re-request — and on Safari re-prompt — forever); a
  // different request (a device newly blocked, so a different source set) has a new signature and
  // is still allowed. See useAttemptSignatureGuard for the Safari rationale.
  const previewInitGuard = useAttemptSignatureGuard();

  const stableInitLocalPublisher = useEffectEvent(() => {
    if (!publisher) {
      const signature = `${deniedDevices.microphone}|${deniedDevices.camera}`;
      if (previewInitGuard.shouldAttempt(signature)) {
        initLocalPublisher();
      }
    }
  });

  // Tear down THIS render's publisher on change/unmount — captured explicitly, NOT via the live ref.
  // A re-grant recovery destroys the old publisher and rebuilds into the same ref (synchronously on
  // Safari, where publisher.destroy() fires 'destroyed' sync). If this cleanup called the arg-less
  // destroyPublisher() it would act on the live publisherRef and kill the NEWLY built publisher
  // mid-bind ('NativeVideoElementWrapper is destroyed' / Connection Failed 1013). Passing the specific
  // old instance instead is a harmless no-op (it is already gone) and leaves the rebuilt one alone.
  useEffect(() => {
    stableInitLocalPublisher();
    const currentPublisher = publisher;
    return () => {
      if (currentPublisher) {
        destroyPublisher(currentPublisher);
      }
    };
  }, [publisher, destroyPublisher]);

  // Re-arm the retry guard once the preview is actually publishing (a real acquire), so a later
  // legitimate re-init is allowed. Kept in its own effect so it never triggers the destroy cleanup
  // of the [publisher] effect above.
  useEffect(() => {
    if (isPublishing) {
      previewInitGuard.reset();
    }
  }, [isPublishing, previewInitGuard]);

  // When the user re-grants a previously denied permission the publisher reports ACCESS_CHANGED (both
  // the Safari reacquireDevice fallback and the Chrome permissions.onchange watcher funnel here). Drive
  // the re-init: tear down the current publisher and rebuild with the new source set — but SERIALIZED.
  //
  // Serialization is the crux: re-granting a second device (both denied → mic → camera) while the mic
  // rebuild's getUserMedia is still acquiring would destroy that publisher mid-acquire, which aborts
  // the getUserMedia (OT_CANCEL) and wedges the SDK ('Destroyed' cannot transition to 'Failed'),
  // leaving the room stuck on the loading skeleton. So we only tear down + rebuild once no acquire is
  // in flight (isAcquiring false); until then we mark the recovery pending and let the in-flight
  // publisher settle first.
  //
  // The pending flag survives the wait (accessStatus settles to ACCEPTED meanwhile), and deniedDevices
  // is a dep so a second grant whose setAccessStatus(ACCESS_CHANGED) is a no-op (React bails on the
  // same value) still re-runs this. Resetting the init guard lets the post-destroy [publisher]-effect
  // rebuild proceed even when the recovered signature matches an earlier one (e.g. `false|false` equals
  // the optimistic mount signature, and a mic-only intermediate publisher never fires
  // videoElementCreated so isPublishing never flips to clear the guard). initLocalPublisher() also runs
  // directly for the null-publisher case (an initial getUserMedia failure leaves the ref null, so there
  // is no 'destroyed' event to drive the [publisher] effect).
  const pendingRecoveryRef = useRef(false);
  useEffect(() => {
    if (accessStatus === DEVICE_ACCESS_STATUS.ACCESS_CHANGED) {
      pendingRecoveryRef.current = true;
    }
    if (!pendingRecoveryRef.current || isAcquiring) {
      return;
    }
    pendingRecoveryRef.current = false;
    previewInitGuard.reset();
    destroyPublisher();
    initLocalPublisher();
  }, [
    accessStatus,
    isAcquiring,
    deniedDevices,
    destroyPublisher,
    initLocalPublisher,
    previewInitGuard,
  ]);

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
