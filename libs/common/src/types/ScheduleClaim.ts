/**
 * Wire format of the schedule claim: `at` is the start in Unix seconds, `min` the duration in minutes.
 */
export type ScheduleClaim = {
  at: number;
  min: number;
};

export default ScheduleClaim;
