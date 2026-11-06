import { useServerSettings } from '@core/hooks';
import { isNil } from '@common/assertions';
import { MAX_TOTAL_EXTENSION_MINUTES } from '@common/constants';
import { readExtendedClaim } from '@common/helpers';
import useSessionContext from '@hooks/useSessionContext';
import getExtensionOptions, { type ExtensionOption } from '../helpers/getExtensionOptions';

export type MeetingExtension = {
  extendedMinutes: number;
  maxTotalMinutes: number;
  options: ExtensionOption[];
  isAtLimit: boolean;
};

/**
 * How far the current meeting has been extended and which extensions are still possible,
 * or null until the server settings are known.
 */
const useMeetingExtension = (): MeetingExtension | null => {
  const { sessionDetails, sessionKey } = useSessionContext();
  const { data: serverSettings } = useServerSettings({ sessionKey });

  if (isNil(serverSettings)) return null;

  const { options } = serverSettings.extension;
  const extendedMinutes = readExtendedClaim(sessionDetails ?? {});
  const extensionOptions = getExtensionOptions({
    options,
    maxTotalMinutes: MAX_TOTAL_EXTENSION_MINUTES,
    extendedMinutes,
  });

  return {
    extendedMinutes,
    maxTotalMinutes: MAX_TOTAL_EXTENSION_MINUTES,
    options: extensionOptions,
    isAtLimit: extensionOptions.every(({ isAvailable }) => !isAvailable),
  };
};

export default useMeetingExtension;
