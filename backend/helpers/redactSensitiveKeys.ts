// Substrings that mark a key as sensitive. Matched anywhere within the key name
// so that variants like `apiKey`, `accessToken`, or `clientSecret` are all redacted.
const SENSITIVE_KEY_SUBSTRINGS =
  'token|key|secret|password|passwd|authorization|auth|credential|cookie';

// Personally identifiable information keys, matched as exact key names.
const PERSONAL_INFO_KEYS = 'first_name|last_name|email|phone_number';

const REDACTED_KEY_PATTERN = new RegExp(
  `(${SENSITIVE_KEY_SUBSTRINGS})|^(${PERSONAL_INFO_KEYS})$`,
  'i'
);

const REDACTED_VALUE = '[REDACTED]';
const MAX_DEPTH = 8;

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
      REDACTED_KEY_PATTERN.test(key) ? REDACTED_VALUE : redactSensitiveKeys(nestedValue, depth + 1),
    ])
  );
}

export default redactSensitiveKeys;
