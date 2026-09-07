const SENSITIVE_KEY_PATTERN = /token|key|secret|password|authorization|credential/i;
const REDACTED_VALUE = '[REDACTED]';
const MAX_DEPTH = 8;

/**
 * Recursively redacts values whose key matches a sensitive pattern (token, key, secret, password,
 * authorization, credential), replacing them with '[REDACTED]'. Used to strip credentials/PII from
 * client-supplied log payloads before they are forwarded to external logging or printed to stdout.
 *
 * The key name is preserved (only the value is redacted) so it is still visible that a sensitive
 * field was present. Nested objects and arrays are walked up to a bounded depth.
 * @param {unknown} value - The value to redact (typically a client log payload object).
 * @param {number} depth - Current recursion depth (internal).
 * @returns {unknown} A redacted copy; primitives are returned unchanged.
 */
function redactSensitiveKeys(value: unknown, depth = 0): unknown {
  if (depth >= MAX_DEPTH || value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveKeys(item, depth + 1));
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key)
        ? REDACTED_VALUE
        : redactSensitiveKeys(nestedValue, depth + 1),
    ])
  );
}

export default redactSensitiveKeys;
