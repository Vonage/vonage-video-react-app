/**
 * Returns the raw `Set-Cookie` header line for a cookie name, or undefined.
 */
function readSetCookie({
  headers,
  name,
}: {
  headers: Record<string, unknown>;
  name: string;
}): string | undefined {
  const setCookieHeaders = (headers['set-cookie'] ?? []) as string[];

  return setCookieHeaders.find((cookie) => cookie.startsWith(`${name}=`));
}

export default readSetCookie;
