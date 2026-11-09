/**
 * Wire format of the schedule claim: the start in Unix epoch milliseconds and the duration in minutes.
 */
export type ScheduleClaim = {
  startsAtMs: number;
  durationMins: number;
};

export default ScheduleClaim;
