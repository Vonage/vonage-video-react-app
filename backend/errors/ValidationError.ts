export type ValidationIssue = {
  path: (string | number)[];
  message: string;
};

export class ValidationError extends Error {
  public readonly statusCode = 400;
  public readonly code = 'VALIDATION_ERROR';
  public readonly severity = 'error';
  public readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[], message = 'Invalid request') {
    super(message);
    this.name = 'ValidationError';
    this.issues = issues;
  }
}
