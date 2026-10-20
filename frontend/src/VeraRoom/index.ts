// runs interceptors before vonage sdk initialize resources (XHR, navigator.mediaDevices clones, etc)
import '@core/interceptors';

import '../i18n';
import './VeraRoomElement';

export { createVideoClient } from '@core/services';
export type { VideoClient } from '@core/services';
