import type { DevicesAPI } from '../../../types';
import actions from 'react-global-state-hooks/actions';
import { default as syncAudioOutputDevicesList } from './syncAudioOutputDevicesList';
import { default as syncDevicesList } from './syncDevicesList';
import { default as syncMediaDevicesList } from './syncMediaDevicesList';
import type { SetupAPI } from '../types/SetupAPI';

/**
 * Internal actions to setup the DevicesStore
 * This actions are not needed for final consumers so we wont add them into the public namespace devices$.actions
 */
const internals: (api: DevicesAPI) => SetupAPI = actions<DevicesAPI>()({
  syncDevicesList,
  syncAudioOutputDevicesList,
  syncMediaDevicesList,
});

export default internals;
