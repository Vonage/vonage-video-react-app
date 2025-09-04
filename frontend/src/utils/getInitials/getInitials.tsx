const getInitialFromName = (name: string): string => {
  return name.split('')[0].toUpperCase();
};

/**
 * Returns the initials, 0-2 characters, for a given username.
 * @param {string} username - The username for which the initials are to be determined.
 * @returns {string} The initials for the given username.
 */
export default (username: string): string => {
  // Matches any names, including hyphenated names.
  const names = username.match(/[\p{L}\p{M}]+([-][\p{L}\p{M}]+)*/gu);
  let lastInitial = '';

  if (!names) {
    return '';
  }

  const firstInitial = getInitialFromName(names[0]);
  if (names.length > 1) {
    lastInitial = getInitialFromName(names[names.length - 1]);
  }

  return `${firstInitial}${lastInitial}`;
};
