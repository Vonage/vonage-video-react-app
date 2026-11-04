/**
 * The next full hour after `now`, in local time, as the values of a date and a time input.
 */
function getDefaultMeetingStart({ now }: { now: number }): {
  startDate: string;
  startTime: string;
} {
  const start = new Date(now);
  start.setHours(start.getHours() + 1, 0, 0, 0);

  const year = start.getFullYear();
  const month = String(start.getMonth() + 1).padStart(2, '0');
  const day = String(start.getDate()).padStart(2, '0');
  const hours = String(start.getHours()).padStart(2, '0');

  return { startDate: `${year}-${month}-${day}`, startTime: `${hours}:00` };
}

export default getDefaultMeetingStart;
