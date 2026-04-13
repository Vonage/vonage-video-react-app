/**
 * Determines whether a given string is a Vonage Video API sessionId-like string.
 * A sessionId-like string has the format `prefix_base64data` (exactly two parts split by `_`).
 * @param {string} value - The value to check.
 * @returns {boolean} True if the value matches the sessionId-like format.
 */
const isSessionIdLike = (value: string): boolean => {
  const parts = value.split('_');
  const looksLikeBase64 = /^[a-z0-9+/=-]+$/i.test(parts[1]);

  const isSessionId =
    parts.length === 2 && parts[0].length > 0 && parts[1].length > 50 && looksLikeBase64;

  return Boolean(isSessionId);
};

export default isSessionIdLike;
