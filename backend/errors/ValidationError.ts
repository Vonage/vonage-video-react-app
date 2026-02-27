import StatusCodeEnum from 'status-code-enum';
import ApplicationError from '@common/errors/ApplicationError';

export type ValidationIssue = {
  path: (string | number)[];
  message: string;
};

export class ValidationError extends ApplicationError {
  public readonly code = 'VALIDATION_ERROR';
  public readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[], message = 'Invalid request') {
    super({
      src: new Error(message),
      fallbackConfig: {
        fallbackMessage: message,
        statusCode: StatusCodeEnum.ClientErrorBadRequest,
        severity: 'error',
      },
    });
    this.name = 'ValidationError';
    this.issues = issues;
  }

  public override exportSafely = () => {
    const base = this.exportSafelyBase();
    return {
      ...base,
      code: 'VALIDATION_ERROR',
      issues: this.issues,
      statusCode: base.statusCode ?? this.statusCode ?? 400,
    };
  };
}
