import type { DevicesAPI } from '../../../types';
import actions from 'react-global-state-hooks/actions';
import { default as syncAudioOutputDevicesList } from './syncAudioOutputDevicesList';
import { default as syncDevicesList } from './syncDevicesList';
import { default as syncMediaDevicesList } from './syncMediaDevicesList';

export default actions<DevicesAPI>()({
  syncDevicesList,
  syncAudioOutputDevicesList,
  syncMediaDevicesList,
});
