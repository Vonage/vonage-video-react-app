import type { Request } from 'express';
import { makeForbiddenErrorHandler } from '@api-lib/errors';
import { isAllowedOrigin } from '@common/helpers';

function assertAllowedOrigin({
  req,
  allowedOrigins,
}: {
  req: Request;
  allowedOrigins: '*' | readonly string[];
}): void {
  const requestOrigin = req.headers.origin;

  if (requestOrigin === undefined) return;
  if (isAllowedOrigin({ origin: requestOrigin, allowedOrigins })) return;

  throw makeForbiddenErrorHandler(`Requests are not allowed from origin ${requestOrigin}`)(null);
}

export default assertAllowedOrigin;
