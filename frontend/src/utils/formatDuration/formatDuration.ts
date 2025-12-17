/**
 * Formats duration from seconds to HH:MM:SS or MM:SS format
 * @param {number | undefined} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 * @example
 * formatDuration(65) // returns "1:05"
 * formatDuration(3665) // returns "1:01:05"
 * formatDuration(undefined) // returns "--:--"
 */
function formatDuration(seconds: number | undefined): string {
  if (!seconds || seconds < 0) return '--:--';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default formatDuration;
