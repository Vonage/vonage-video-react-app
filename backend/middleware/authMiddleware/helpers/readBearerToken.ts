import type { Request } from 'express';

function readBearerToken({
  req,
  authHeaderName,
  authScheme,
}: {
  req: Request;
  authHeaderName: string;
  authScheme: string;
}): string | undefined {
  const headerValue = req.headers[authHeaderName.toLowerCase()];
  const authorizationHeader = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  const schemePrefix = `${authScheme.toLowerCase()} `;

  if (!authorizationHeader?.toLowerCase().startsWith(schemePrefix)) return undefined;

  const token = authorizationHeader.slice(schemePrefix.length).trim();

  return token === '' ? undefined : token;
}

export default readBearerToken;
