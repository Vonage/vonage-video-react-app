import { makeApplicationErrorMapper } from '@core/errors';
import { frontendLogger } from '../../../logger';

/**
 * Builds an error handler that maps a raw error into an ApplicationError and reports it through the
 * frontend logger. Meant to be passed as the `onError` callback of `attempt` when applying an
 * advanced setting to a publisher.
 * @param {object} args - the reporting context
 * @param {string} args.message - human readable description of what failed
 * @param {string} args.eventSource - identifier of the call site for telemetry
 * @returns {(error: unknown) => void} the error handler
 */
const handleApplyAdvancedSettingsError = ({
  message,
  eventSource,
}: {
  message: string;
  eventSource: string;
}) => {
  return (error: unknown) => {
    const applicationError = makeApplicationErrorMapper(message)(error);

    frontendLogger.reportError(applicationError, {
      eventSource,
    });
  };
};

export default handleApplyAdvancedSettingsError;
