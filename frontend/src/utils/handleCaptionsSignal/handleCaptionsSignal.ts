import { Dispatch, SetStateAction } from 'react';
import { SignalEvent } from '../../types/session';

/**
 * @typedef {object} CaptionsSignalDataType
 * @property {string} action - The action to be performed on captions ('enable', 'disable').
 * @property {string} captionsId - The ID of the captions to be enabled or disabled.
 */
export type CaptionsSignalDataType = {
  action: 'enable' | 'disable';
  captionsId: string;
};

/**
 * @typedef {object} CaptionsHandleType
 * @property {SignalEvent} event - The signal event containing the data.
 * @property {Dispatch<SetStateAction<boolean>>} setIsSessionCaptioningEnabled - Function to set the captions enabled state.
 */
export type CaptionsHandleType = {
  event: SignalEvent;
  setIsSessionCaptioningEnabled: Dispatch<SetStateAction<boolean>>;
};

/**
 * Handles the captions signal received from the session.
 * This function manages enabling and disabling the captions.
 * @param {CaptionsHandleType} props - Dependencies needed for the handler
 * @property {SignalEvent} event - The signal event containing the data.
 * @property {Dispatch<SetStateAction<boolean>>} setIsSessionCaptioningEnabled - Function to set the captions enabled state.
 */
const handleCaptionsSignal = ({ event, setIsSessionCaptioningEnabled }: CaptionsHandleType) => {
  try {
    if (!event.data) {
      return;
    }

    const parsedData: CaptionsSignalDataType = JSON.parse(event.data);
    const { action, captionsId } = parsedData;

    switch (action) {
      case 'enable':
        if (captionsId) {
          setIsSessionCaptioningEnabled(true);
        }
        break;

      case 'disable':
        setIsSessionCaptioningEnabled(false);
        break;

      default:
        console.warn(`Unknown captions action: ${action}`);
        break;
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`Error handling captions signal: ${err.message}`);
    }
  }
};

export default handleCaptionsSignal;
