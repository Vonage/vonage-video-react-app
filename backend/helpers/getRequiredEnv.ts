/**
 * Reads a required environment variable, failing fast with a descriptive error
 * if it is missing. This surfaces misconfiguration clearly at startup instead of
 * as an opaque runtime crash later (e.g. a non-null assertion on `undefined`).
 *
 * @param {string} name - The environment variable name.
 * @returns {string} The variable's value.
 * @throws {Error} If the variable is unset or empty.
 */
const getRequiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". Set it before starting the server.`
    );
  }

  return value;
};

export default getRequiredEnv;
