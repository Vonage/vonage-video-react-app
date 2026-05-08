import type { Request, Response, NextFunction } from 'express';
import StatusCodeEnum from 'status-code-enum';
import { isApplicationError } from '@common/errors/assertions';
import ApplicationServerError from '@api-lib/errors/ApplicationServerError';

const isDevelopment = process.env.NODE_ENV !== 'production';

function tryToLogApplicationError(error: unknown): void {
  try {
    if (error instanceof ApplicationServerError) {
      console.error('[ApplicationServerError]', error.retrieveErrorLogDetails());
    } else if (isApplicationError(error)) {
      console.error('[ApplicationError]', error.message);
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
  const safeError = applicationError.exportSafely();
  const { statusCode } = safeError;

  const accepts = req.headers.accept ?? '';

  const isJsonRequest =
    accepts.includes('application/json') ||
    req.xhr ||
    req.headers?.['content-type']?.includes('application/json');

  if (isJsonRequest) {
    res.status(safeError.statusCode).json(safeError);
    return;
  }

  const isHtmlRequest = accepts.includes('text/html');

  if (isHtmlRequest) {
    const safeMessage = safeError.message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    res
      .status(statusCode)
      .send(`<!DOCTYPE html><html><body><h1>${statusCode}</h1><p>${safeMessage}</p></body></html>`);

    return;
  }

  // fallback to plain text response for other request types
  res.status(statusCode).send(safeError.message);
}
