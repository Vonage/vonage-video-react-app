import notifications$ from '@core/stores/notifications';
import { makeApplicationErrorMapper, type ApplicationClientError } from '@core/errors';
import { Collapsible } from '../../components';
import classNames from 'classnames';
import type { ZodIssue } from '@common/errors';
import logger from '@core/logger';
import { isString } from '@common/assertions';

/**
 * Handles application errors on the client by showing a notification with the error message and details
 */
function handleClientApplicationError(error: ApplicationClientError): void;

/**
 * Handles application errors on the client by showing a notification with the error message and details.
 * The fallbackMessage only will be shown to the user if the exception is not an ApplicationClientError.
 */
function handleClientApplicationError(fallbackMessage: string, error: unknown): void;

function handleClientApplicationError(arg0: ApplicationClientError | string, arg1?: unknown): void {
  const fallbackMessage = isString(arg0) ? arg0 : arg0.fallbackConfig.fallbackMessage;
  const error = isString(arg0) ? makeApplicationErrorMapper(fallbackMessage)(arg1) : arg0;

  notifications$.actions.push({
    type: 'warning',
    message: error.fallbackMessage,
    expirationMs: null,
    children: error.issues.length ? makeErrorDetails(error) : undefined,
  });

  logger.reportError(error);
}

function makeErrorDetails(error: ApplicationClientError) {
  if (!error.issues?.length) return null;

  return (
    <Collapsible>
      <Collapsible.Summary>
        {({ open }) => (
          <span
            className={classNames(
              'cursor-pointer',
              'text-vera-information hover:text-vera-information-hover hover:underline'
            )}
          >
            {open ? 'See less' : 'See details'}
          </span>
        )}
      </Collapsible.Summary>

      <Collapsible.Details
        className={classNames(
          'flex flex-col gap-3 whitespace-pre-line w-[calc(100%+34px)]',
          'whitespace-pre-wrap text-vera-tertiary'
        )}
      >
        {error.issues.map((issue: unknown, index) => {
          const isZodIssue = isZodIssueObject(issue);

          return (
            <div key={index} className="text-vera-body-base">
              <span className="text-vera-secondary">
                ✖ {isZodIssue ? issueLabel(issue) : (issue as string)}
              </span>

              {isZodIssue && issue.expected && issue.received && (
                <p className="pl-2">
                  expected {issue.expected}, received {issue.received}
                </p>
              )}

              {isZodIssue && issue.path.length > 0 && (
                <p className="pl-2">→ at {issue.path.join('.')}</p>
              )}
            </div>
          );
        })}
      </Collapsible.Details>
    </Collapsible>
  );
}

function issueLabel(issue: ZodIssue): string {
  if (issue.expected && issue.received) {
    return issue.message.split(':')[0] + ':';
  }

  return issue.message;
}

function isZodIssueObject(issue: unknown): issue is ZodIssue {
  return (
    typeof issue === 'object' &&
    issue !== null &&
    typeof (issue as ZodIssue).message === 'string' &&
    Array.isArray((issue as ZodIssue).path)
  );
}

export default handleClientApplicationError;
