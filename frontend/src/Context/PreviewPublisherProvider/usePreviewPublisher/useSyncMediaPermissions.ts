import React, { useEffect } from 'react';

/**
 * Hook to synchronize media permissions with the enabled state of audio and video.
 * Disables audio or video if the app is not configured to allow control over the respective media type.
 * @param {object} params - The parameters for the hook.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} params.setIsVideoEnabled - Function to set video enabled state.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} params.setIsAudioEnabled - Function to set audio enabled state.
 * @param {boolean} params.isCameraControlAllowed - Whether camera control is allowed.
 * @param {boolean} params.isMicrophoneControlAllowed - Whether microphone control is allowed.
 */
function useSyncMediaPermissions({
  setIsVideoEnabled,
  setIsAudioEnabled,
  isCameraControlAllowed,
  isMicrophoneControlAllowed,
}: {
  setIsVideoEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAudioEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isCameraControlAllowed: boolean;
  isMicrophoneControlAllowed: boolean;
}) {
  useEffect(() => {
    setIsVideoEnabled((enabled) => (isCameraControlAllowed ? enabled : false));
    setIsAudioEnabled((enabled) => (isMicrophoneControlAllowed ? enabled : false));
  }, [setIsVideoEnabled, setIsAudioEnabled, isMicrophoneControlAllowed, isCameraControlAllowed]);
}

export default useSyncMediaPermissions;
