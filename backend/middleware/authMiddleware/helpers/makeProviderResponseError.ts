import { isRecord, isString } from '@common/assertions';

/**
 * Builds a plain error from an identity provider's HTTP error response, carrying only the endpoint,
 * status and RFC 6749 `error` code, so the request body (tokens, codes) never reaches the logs.
 */
function makeProviderResponseError({
  endpoint,
  response,
}: {
  endpoint: string;
  response: { status: number; data: unknown };
}): Error {
  const providerErrorCode =
    isRecord(response.data) && isString(response.data.error) ? response.data.error : undefined;
  const providerErrorDetails = providerErrorCode ? ` (${providerErrorCode})` : '';

  return new Error(`${endpoint} responded with status ${response.status}${providerErrorDetails}`);
}

export default makeProviderResponseError;
