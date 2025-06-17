/* eslint-disable no-param-reassign */
import { RefObject, Dispatch, SetStateAction } from 'react';
import { SignalEvent } from '../../types/session';

/**
 * @typedef {object} CaptionsSignalDataType
 * @property {string} action - The action to be performed on captions (e.g., 'enable', 'disable', 'join', 'leave').
 * @property {string} captionsId - The ID of the captions to be enabled or disabled.
 * @property {number} currentCount (optional) - The current count of active participants using captions.
 */
export type CaptionsSignalDataType = {
  action: 'enable' | 'disable';
  captionsId: string;
  currentCount?: number;
};

/**
 * @typedef {object} CaptionsHandleType
 * @property {SignalEvent} event - The signal event containing the data.
 * @property {RefObject<string | null>} currentCaptionsIdRef - Reference to the current captions ID.
 * @property {Dispatch<SetStateAction<boolean>>} setIsCaptioningEnabled - Function to set the captions enabled state.
 */
export type CaptionsHandleType = {
  event: SignalEvent;
  currentCaptionsIdRef: RefObject<string | null>;
  setIsCaptioningEnabled: Dispatch<SetStateAction<boolean>>;
};

/**
 * Handles the captions signal received from the session.
 * This function manages enabling, disabling, joining, and leaving captions.
 * It also handles the functionality of notifying other participants about the current captions ID and the participant count.
 * @param {CaptionsHandleType} props - Dependencies needed for the handler
 * @property {SignalEvent} event - The signal event containing the data.
 * @property {RefObject<string | null>} currentCaptionsIdRef - Reference to the current captions ID
 */
const handleCaptionsSignal = ({
  event,
  currentCaptionsIdRef,
  setIsCaptioningEnabled,
}: CaptionsHandleType) => {
  try {
    if (!event.data) {
      return;
    }

    const parsedData: CaptionsSignalDataType = JSON.parse(event.data);
    const { action, captionsId } = parsedData;

    switch (action) {
      case 'enable':
        if (captionsId) {
          currentCaptionsIdRef.current = captionsId;
          setIsCaptioningEnabled(true);
        }
        break;

      case 'disable':
        // We turned off the captions session-wide
        currentCaptionsIdRef.current = null;
        setIsCaptioningEnabled(false);
        break;

      default:
        console.warn(`Unknown captions action: ${action}`);
        break;
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err);
    }
  }
};

export default handleCaptionsSignal;
