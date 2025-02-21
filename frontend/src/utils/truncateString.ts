/**
 * truncate a string to maxLength and add ellipsis
 * @param {string} str - string to be truncated
 * @param {number} maxLength - max length of string
 * @returns {string} truncated string
 */
const truncateString = (str: string, maxLength: number) => {
  if (str.length > maxLength) {
    return `${str.slice(0, maxLength - 3)}...`;
  }
  return str;
};
export default truncateString;
