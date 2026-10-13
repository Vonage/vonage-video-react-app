import type { ActiveTokenIntrospectionResponse } from '../schemas/TokenIntrospectionResponse.schema';

/**
 * RFC 7662 makes `client_id` optional, so `aud` is the fallback ownership signal when it's absent.
 */
function isTokenIssuedToClient({
  introspectionData,
  clientId,
}: {
  introspectionData: ActiveTokenIntrospectionResponse;
  clientId: string;
}): boolean {
  if (introspectionData.client_id !== undefined) return introspectionData.client_id === clientId;

  const audiences = [introspectionData.aud ?? []].flat();

  return audiences.includes(clientId);
}

export default isTokenIssuedToClient;
