/**
 * Reads a single named cookie's value out of a raw `Cookie` request header,
 * without pulling in a cookie-parsing dependency.
 */
export const getCookieValue = ({
  cookieHeader,
  name,
}: {
  cookieHeader: string | undefined;
  name: string;
}): string | undefined => {
  if (!cookieHeader) return undefined;

  const cookiePair = cookieHeader
    .split(';')
    .map((pair) => pair.trim())
    .find((pair) => pair.startsWith(`${name}=`));

  if (!cookiePair) return undefined;

  try {
    return decodeURIComponent(cookiePair.slice(name.length + 1));
  } catch {
    return undefined;
  }
};

export default getCookieValue;
