import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Settles only when the middleware calls `next`; a middleware that ends the response itself never settles.
 */
function runExpressMiddleware({
  middleware,
  req,
  res,
}: {
  middleware: RequestHandler;
  req: Request;
  res: Response;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const next: NextFunction = (error?: unknown) => {
      if (error) return reject(error);

      resolve();
    };

    Promise.resolve(middleware(req, res, next)).catch(reject);
  });
}

export default runExpressMiddleware;
