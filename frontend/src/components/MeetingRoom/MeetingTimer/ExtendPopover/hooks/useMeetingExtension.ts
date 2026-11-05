import { useServerSettings } from '@core/hooks';
import { isNil } from '@common/assertions';
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
  const { sessionDetails } = useSessionContext();
  const { data: serverSettings } = useServerSettings();

  if (isNil(serverSettings)) return null;

  const { maxTotalMinutes, options } = serverSettings.extension;
  const extendedMinutes = readExtendedClaim(sessionDetails ?? {});
  const extensionOptions = getExtensionOptions({ options, maxTotalMinutes, extendedMinutes });

  return {
    extendedMinutes,
    maxTotalMinutes,
    options: extensionOptions,
    isAtLimit: extensionOptions.every(({ isAvailable }) => !isAvailable),
  };
};

export default useMeetingExtension;
