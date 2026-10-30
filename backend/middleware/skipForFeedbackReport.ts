import type { RequestHandler } from 'express';

const FEEDBACK_REPORT_PATH = '/feedback/report';

/**
 * Runs `middleware` for every request except POST /feedback/report, which parses its own body
 * with a tighter size limit.
 */
export default function skipForFeedbackReport(middleware: RequestHandler): RequestHandler {
  return (request, response, next) => {
    if (isFeedbackReportPath(request.path)) {
      next();
      return;
    }

    middleware(request, response, next);
  };
}

/**
 * Express routing is case-insensitive and tolerates a trailing slash, so an exact comparison
 * would let `/Feedback/report/` reach the route through the global 20mb parsers.
 */
function isFeedbackReportPath(requestPath: string): boolean {
  const collapsedPath = requestPath.toLowerCase().replace(/\/{2,}/g, '/');
  const normalizedPath = collapsedPath.endsWith('/') ? collapsedPath.slice(0, -1) : collapsedPath;

  return normalizedPath === FEEDBACK_REPORT_PATH;
}
