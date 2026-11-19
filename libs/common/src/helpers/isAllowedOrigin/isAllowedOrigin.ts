/**
 * Checks a request `Origin` against an allowlist: `*` allows any origin; otherwise each entry is an
 * exact origin, optionally with one `*` in its first host label (e.g. `https://app-*.example.com`).
 */
const isAllowedOrigin = ({
  origin,
  allowedOrigins,
}: {
  origin: string;
  allowedOrigins: '*' | readonly string[];
}): boolean => {
  if (allowedOrigins === '*') return true;

  const normalizedOrigin = origin.toLowerCase();

  return allowedOrigins.some((allowedOrigin) =>
    matchesAllowedOrigin({ origin: normalizedOrigin, allowedOrigin: allowedOrigin.toLowerCase() })
  );
};

function matchesAllowedOrigin({
  origin,
  allowedOrigin,
}: {
  origin: string;
  allowedOrigin: string;
}): boolean {
  const [prefix, suffix] = allowedOrigin.split('*');

  if (suffix === undefined) return origin === allowedOrigin;

  const isLongEnough = origin.length > prefix.length + suffix.length;
  const wildcardValue = origin.slice(prefix.length, origin.length - suffix.length);
  const staysInFirstLabel = /^[a-z0-9-]+$/.test(wildcardValue);

  return isLongEnough && origin.startsWith(prefix) && origin.endsWith(suffix) && staysInFirstLabel;
}

export default isAllowedOrigin;
