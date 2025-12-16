/**
 * Formats file size from bytes to human-readable format
 * @param {number | undefined} bytes - File size in bytes
 * @returns {string} Formatted file size string
 * @example
 * formatFileSize(1024) // returns "1.0 KB"
 * formatFileSize(1048576) // returns "1.0 MB"
 * formatFileSize(undefined) // returns "--"
 */
function formatFileSize(bytes: number | undefined): string {
  if (!bytes || bytes < 0) return '--';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // For bytes, don't show decimals
  const decimals = unitIndex === 0 ? 0 : 1;
  return `${size.toFixed(decimals)} ${units[unitIndex]}`;
}

export default formatFileSize;
