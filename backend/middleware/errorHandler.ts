import type { Request, Response, NextFunction } from 'express';
import StatusCodeEnum from 'status-code-enum';
import { isApplicationError } from '@common/errors/assertions';
import ApplicationServerError from '@api-lib/errors/ApplicationServerError';
import { ValidationError } from '../errors/ValidationError';

const isDevelopment = process.env.NODE_ENV !== 'production';

function tryToLogApplicationError(error: unknown): void {
  try {
    if (error instanceof ApplicationServerError) {
      console.error('[ApplicationServerError]', error.retrieveErrorLogDetails());
    } else if (isApplicationError(error)) {
      console.error('[ApplicationError]', error.message);
    } else if (error instanceof ValidationError) {
      console.error('[ValidationError]', JSON.stringify({ issues: error.issues }));
    } else {
      console.error('[Error]', error);
    }
  } catch {
    console.error('[Error] (log failed)', error);
  }
}

/**
 * Application-level error handler. Handles ValidationError with structured issues,
 * and all other errors via ApplicationServerError with safe export.
 */
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (res.headersSent) return;

  tryToLogApplicationError(error);

  if (isDevelopment) {
    console.error('Development error log:', error);
  }

  const applicationError = new ApplicationServerError({
    src: error,
    // If the error is not an ApplicationError, fallback to internal server error
    fallbackConfig: {
      fallbackMessage: 'Internal server error',
      statusCode: StatusCodeEnum.ServerErrorInternal,
    },
  });

  // avoids exposing sensitive information while still providing useful error information
  let safeError = applicationError.exportSafely();
  let statusCode =
    applicationError.statusCode ?? (safeError as { statusCode?: number }).statusCode ?? 500;

  // ValidationError: use its exportSafely for proper statusCode and issues (avoids ESM/instanceof quirks)
  if (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === 'VALIDATION_ERROR' &&
    Array.isArray((error as { issues?: unknown }).issues)
  ) {
    const validationSafe = (error as ValidationError).exportSafely();
    safeError = validationSafe;
    statusCode = validationSafe.statusCode ?? 400;
  }

  const safeErrorWithStatus = { ...safeError, statusCode };

  const accepts = req.headers.accept ?? '';

  const isJsonRequest =
    accepts.includes('application/json') ||
    req.xhr ||
    req.headers?.['content-type']?.includes('application/json');

  if (isJsonRequest) {
    res.status(statusCode).json(safeErrorWithStatus);
    return;
  }

  const isHtmlRequest = accepts.includes('text/html');

  if (isHtmlRequest) {
    res.status(statusCode).render('index', {
      error: safeErrorWithStatus,
    });

    return;
  }

  // fallback to plain text response for other request types
  res.status(statusCode).send(safeError.message);
}
