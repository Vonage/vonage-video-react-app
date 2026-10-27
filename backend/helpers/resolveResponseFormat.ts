import type { Request } from 'express';

type ResponseFormat = 'json' | 'html' | 'text';

function resolveResponseFormat(req: Request): ResponseFormat {
  const accepts = req.headers.accept ?? '';

  const isJsonRequest =
    accepts.includes('application/json') ||
    req.xhr ||
    req.headers?.['content-type']?.includes('application/json');

  if (isJsonRequest) return 'json';
  if (accepts.includes('text/html')) return 'html';
  return 'text';
}

export default resolveResponseFormat;
