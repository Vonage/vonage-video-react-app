import { isNil } from '@common/assertions';
import type { ServerSettingsAPI } from '../types';

function getSecondsUntilEnd() {
  return function readSecondsUntilEnd({ getState }: ServerSettingsAPI): number | null {
    const { scheduleWindow, status, now } = getState();
    if (isNil(scheduleWindow) || status !== 'known') return null;

    return Math.max(0, Math.ceil((scheduleWindow.endsAtMs - now) / 1000));
  };
}

export default getSecondsUntilEnd;
