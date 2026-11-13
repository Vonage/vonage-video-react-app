import { isNil } from '@common/assertions';
import type { ServerSettingsState } from '../types';

function getSecondsUntilEnd({ scheduleWindow, status, now }: ServerSettingsState): number | null {
  if (isNil(scheduleWindow) || status !== 'known') return null;

  return Math.max(0, Math.ceil((scheduleWindow.endsAtMs - now) / 1000));
}

export default getSecondsUntilEnd;
