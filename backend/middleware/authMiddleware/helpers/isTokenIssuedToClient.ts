import type { ActiveTokenIntrospectionResponse } from '../schemas/TokenIntrospectionResponse.schema';

/**
 * RFC 7662 makes `client_id` optional; `aud` is the fallback only when it's absent. On Okta's org
 * authorization server `aud` is the org URL, shared by every app, so it never matches a client ID.
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
