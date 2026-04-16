import { ApplicationServerError, ErrorSeverity } from '@api-lib/errors';
import { TRPC_ERROR_CODES_BY_KEY } from '@trpc/server/rpc';
import { StatusCode } from 'status-code-enum';

// copied from '@trpc/server/unstable-core-do-not-import';
// needed to parse http codes to trpc error codes
const HTTP_CODE_TO_JSONRPC2 = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  402: 'PAYMENT_REQUIRED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  405: 'METHOD_NOT_SUPPORTED',
  408: 'TIMEOUT',
  409: 'CONFLICT',
  412: 'PRECONDITION_FAILED',
  413: 'PAYLOAD_TOO_LARGE',
  415: 'UNSUPPORTED_MEDIA_TYPE',
  422: 'UNPROCESSABLE_CONTENT',
  428: 'PRECONDITION_REQUIRED',
  429: 'TOO_MANY_REQUESTS',
  499: 'CLIENT_CLOSED_REQUEST',
  500: 'INTERNAL_SERVER_ERROR',
  501: 'NOT_IMPLEMENTED',
  502: 'BAD_GATEWAY',
  503: 'SERVICE_UNAVAILABLE',
  504: 'GATEWAY_TIMEOUT',
} as const;

const toTRPCError = (error: ApplicationServerError): FlatTRPCError => {
  const toExport = error.exportSafely();

  const trpcErrorKey =
    HTTP_CODE_TO_JSONRPC2[toExport.statusCode as keyof typeof HTTP_CODE_TO_JSONRPC2] ??
    'INTERNAL_SERVER_ERROR';

  const trpcErrorCode = TRPC_ERROR_CODES_BY_KEY[trpcErrorKey];

  return {
    ...toExport,
    data: {
      httpStatus: toExport.statusCode,
    },
    code: trpcErrorCode,
  };
};

type FlatTRPCError = {
  data: {
    httpStatus: StatusCode;
  };
  code: (typeof TRPC_ERROR_CODES_BY_KEY)[keyof typeof TRPC_ERROR_CODES_BY_KEY];
  message: string;
  severity: ErrorSeverity;
  issues?: string[];
  stack?: string;
  fallbackMessage?: string;
  statusCode: StatusCode;
};

export default toTRPCError;
