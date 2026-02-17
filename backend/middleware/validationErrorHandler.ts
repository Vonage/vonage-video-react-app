import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/ValidationError';

/**
 * Error handler middleware for validation errors.
 * Sends structured error response and logs violations for review.
 */
export function validationErrorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof ValidationError) {
    // Store violations for review.
    console.error('[validation]', JSON.stringify({ issues: error.issues }));

    res.status(error.statusCode).json({
      message: error.message,
      severity: error.severity,
      statusCode: error.statusCode,
      code: error.code,
      issues: error.issues,
    });
    return;
  }
  next(error);
}
