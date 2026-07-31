import createGlobalState from 'react-global-state-hooks/createGlobalState';
import type { DeniedDevices } from '@utils/publisher/deviceAccess';

/**
 * Hand-off of the devices the user denied in the waiting room, written when they join so the in-call
 * publisher can seed its blocked state and exclude those devices from its first getUserMedia —
 * instead of re-prompting the user immediately on join (Google Meet keeps a pre-join denial).
 *
 * The publisher reads this ONCE on mount, seeds its blocked state, then clears it — so a denial is
 * consumed by exactly the join that wrote it and can't leak into a later room reached without the
 * waiting room (e.g. a bypass-waiting-room deep link). It also refines the seed against the live
 * permission, so a device the user allowed between the waiting room and joining is requested normally.
 */
const waitingRoomDenial$ = createGlobalState<DeniedDevices>({ microphone: false, camera: false });

export default waitingRoomDenial$;
