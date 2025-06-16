/* eslint-disable no-param-reassign */
import { RefObject, Dispatch, SetStateAction } from 'react';
import { SignalEvent, SignalType } from '../../types/session';
import { disableCaptions } from '../../api/captions';

/**
 * @typedef {object} CaptionsSignalDataType
 * @property {string} action - The action to be performed on captions (e.g., 'enable', 'disable', 'join', 'leave').
 * @property {string} captionsId - The ID of the captions to be enabled or disabled.
 * @property {number} currentCount (optional) - The current count of active participants using captions.
 */
export type CaptionsSignalDataType = {
  action: string;
  captionsId: string;
  currentCount?: number;
};

/**
 * @typedef {object} CaptionsHandleType
 * @property {SignalEvent} event - The signal event containing the data.
 * @property {RefObject<string | null>} currentCaptionsIdRef - Reference to the current captions ID.
 * @property {RefObject<number>} captionsActiveCountRef - Reference to the count of active participants using captions.
 * @property {RefObject<string | null>} currentRoomNameRef - Reference to the current room name.
 * @property {((data: SignalType) => void) | undefined} vonageVideoClientSignal - The Vonage Video client signal function.
 * @property {Dispatch<SetStateAction<boolean>>} setIsCaptioningEnabled - Function to set the captions enabled state.
 */
export type CaptionsHandleType = {
  event: SignalEvent;
  currentCaptionsIdRef: RefObject<string | null>;
  captionsActiveCountRef: RefObject<number>;
  currentRoomName: string;
  vonageVideoClientSignal: ((data: SignalType) => void) | undefined;
  setIsCaptioningEnabled: Dispatch<SetStateAction<boolean>>;
};

/**
 * Handles the captions signal received from the session.
 * This function manages enabling, disabling, joining, and leaving captions.
 * It also handles the functionality of notifying other participants about the current captions ID and the participant count.
 * @param {CaptionsHandleType} props - Dependencies needed for the handler
 * @property {SignalEvent} event - The signal event containing the data.
 * @property {RefObject<string | null>} currentCaptionsIdRef - Reference to the current captions ID
 * @property {RefObject<number>} captionsActiveCountRef - Reference to the count of active participants using captions
 * @property {string} currentRoomName - Current room name
 * @property {RefObject | null} vonageVideoClient - The Vonage Video client instance
 */
const handleCaptionsSignal = ({
  event,
  currentCaptionsIdRef,
  captionsActiveCountRef,
  currentRoomName,
  vonageVideoClientSignal,
  setIsCaptioningEnabled,
}: CaptionsHandleType) => {
  try {
    const parsedData: CaptionsSignalDataType = JSON.parse(event.data as string);
    const { action, captionsId, currentCount } = parsedData;

    switch (action) {
      case 'enable':
        if (captionsId) {
          currentCaptionsIdRef.current = captionsId;
          setIsCaptioningEnabled(true);
          if (vonageVideoClientSignal) {
            vonageVideoClientSignal({
              type: 'captions',
              data: JSON.stringify({
                action: 'update-current-user-count',
                currentCount: captionsActiveCountRef.current + 1,
              }),
            });
          }
        }
        break;

      case 'join':
        setIsCaptioningEnabled(true);
        captionsActiveCountRef.current += 1;
        break;

      case 'update-current-user-count':
        if (currentCount) {
          captionsActiveCountRef.current = currentCount;
        }
        break;

      case 'leave': {
        const newCount = Math.max(0, captionsActiveCountRef.current - 1);
        setIsCaptioningEnabled(false);

        // If there are no other participants using captions, we disable them for the whole session.
        // This is to ensure that captions are only disabled when there are other participants using them.
        if (newCount === 0 && currentCaptionsIdRef.current && currentRoomName) {
          disableCaptions(currentRoomName, currentCaptionsIdRef.current)
            .then(() => {
              currentCaptionsIdRef.current = null;

              if (vonageVideoClientSignal) {
                vonageVideoClientSignal({
                  type: 'captions',
                  data: JSON.stringify({ action: 'disable' }),
                });
              }
            })
            .catch((err) => console.error('Error disabling captions:', err));
        }

        // If there are participants remaining, we signal the new count to other participants so they can update their tracking of the captions
        if (newCount > 0 && vonageVideoClientSignal) {
          vonageVideoClientSignal({
            type: 'captions',
            data: JSON.stringify({
              action: 'update-current-user-count',
              currentCount: newCount,
            }),
          });
        }
        break;
      }

      case 'disable':
        // We turned off the captions session-wide
        currentCaptionsIdRef.current = null;
        captionsActiveCountRef.current = 0;
        break;

      // Handle the case of sending out captions ID when requested
      case 'request-status':
        if (vonageVideoClientSignal) {
          vonageVideoClientSignal({
            type: 'captions',
            data: JSON.stringify({
              action: 'status-response',
              captionsId: currentCaptionsIdRef.current,
              currentCount: captionsActiveCountRef.current,
            }),
          });
        }
        break;

      // Handle the case of setting the captions ID and count when receiving a status response
      case 'status-response':
        if (!currentCaptionsIdRef.current && captionsId) {
          currentCaptionsIdRef.current = captionsId;
          if (currentCount) {
            captionsActiveCountRef.current = currentCount;
          }
        }
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
