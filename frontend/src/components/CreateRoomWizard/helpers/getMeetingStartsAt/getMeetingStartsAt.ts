/**
 * Start of the meeting in Unix epoch milliseconds, read from the local date and time inputs. `NaN` when either is empty.
 */
function getMeetingStartsAt({
  startDate,
  startTime,
}: {
  startDate: string;
  startTime: string;
}): number {
  return new Date(`${startDate}T${startTime}`).getTime();
}

export default getMeetingStartsAt;
