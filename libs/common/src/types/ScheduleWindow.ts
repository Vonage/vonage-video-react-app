/**
 * Start and end of a scheduled meeting, in Unix epoch milliseconds.
 */
export type ScheduleWindow = {
  startsAtMs: number;
  endsAtMs: number;
};

export default ScheduleWindow;
