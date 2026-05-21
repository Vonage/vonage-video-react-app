import notifications$ from '@core/stores/notifications';
import type { ApplicationClientError } from '@core/errors';
import { Collapsible } from '../../components';
import classNames from 'classnames';
import type { ZodIssue } from '@common/errors';
import logger from '@core/logger';

function handleClientApplicationError(error: ApplicationClientError): void {
  notifications$.actions.push({
    type: 'warning',
    message: error.message,
    expirationMs: null,
    children: error.issues?.length ? makeErrorDetails(error) : undefined,
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
