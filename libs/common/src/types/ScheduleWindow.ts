/**
 * Start and end of a scheduled meeting, in Unix epoch milliseconds.
 */
export type ScheduleWindow = {
  startsAt: number;
  endsAt: number;
};

export default ScheduleWindow;
