/**
 * Validates a username for video calls
 * @param {string} name - The username to validate
 * @returns {boolean} true if the username is valid, false otherwise
 *
 * Rules:
 * - Must not be empty or only whitespace
 * - Length between 1 and 60 characters (after trimming)
 * - Can contain letters, numbers, spaces, hyphens, underscores, apostrophes, and periods
 * - Cannot have multiple consecutive spaces
 * - Cannot start or end with spaces
 */
const isValidUserName = (name: string): boolean => {
  // Check if empty or only whitespace
  if (!name || name.trim() === '') {
    return false;
  }

  const trimmedName = name.trim();

  // Check length (1-60 characters)
  if (trimmedName.length < 1 || trimmedName.length > 60) {
    return false;
  }

  // Check if name is different from trimmed (starts/ends with spaces)
  if (name !== trimmedName) {
    return false;
  }

  // Check for multiple consecutive spaces
  if (/\s{2,}/.test(name)) {
    return false;
  }

  // Allow letters, numbers, spaces, hyphens, underscores, apostrophes, and periods
  // Unicode letters support for international names
  const regex = /^[\p{L}\p{N}\s._'-]+$/u;

  return regex.test(name);
};

export default isValidUserName;
