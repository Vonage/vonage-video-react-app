import { makeSignInRequiredErrorHandler } from '../errors/SignInRequiredError';
import type {
  ActiveTokenIntrospectionResponse,
  TokenIntrospectionResponse,
} from '../schemas/TokenIntrospectionResponse.schema';
import isTokenIssuedToClient from './isTokenIssuedToClient';

function verifyActiveToken({
  introspectionData,
  clientId,
}: {
  introspectionData: TokenIntrospectionResponse;
  clientId: string;
}): ActiveTokenIntrospectionResponse {
  if (!introspectionData.active) {
    throw makeSignInRequiredErrorHandler('Token inactive or expired')(null);
  }

  if (!isTokenIssuedToClient({ introspectionData, clientId })) {
    throw makeSignInRequiredErrorHandler('Token issued for a different client')(null);
  }

  return introspectionData;
}

export default verifyActiveToken;
