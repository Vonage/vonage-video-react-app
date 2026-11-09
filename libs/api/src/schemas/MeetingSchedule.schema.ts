import z from 'zod';
import MAX_DATE_MILLISECONDS from '@api-lib/constants/maxDateMilliseconds';

export const MeetingScheduleSchema = z
  .object({
    startsAt: z
      .number()
      .int()
      .positive()
      .max(MAX_DATE_MILLISECONDS)
      .describe('Start time in Unix epoch milliseconds'),
    durationMinutes: z.number().int().positive().max(1440),
  })
  .refine(
    ({ startsAt, durationMinutes }) => startsAt + durationMinutes * 60_000 > Date.now(),
    'The schedule has already ended, choose an end time in the future'
  );

export type MeetingSchedule = z.infer<typeof MeetingScheduleSchema>;

export default MeetingScheduleSchema;
