import z from 'zod';
import MAX_DATE_MILLISECONDS from '@api-lib/constants/maxDateMilliseconds';

export const MeetingScheduleSchema = z.object({
  startsAt: z
    .number()
    .int()
    .positive()
    .max(MAX_DATE_MILLISECONDS)
    .describe('Start time in Unix epoch milliseconds'),
  durationMinutes: z.number().int().positive().max(1440),
});

export type MeetingSchedule = z.infer<typeof MeetingScheduleSchema>;

export default MeetingScheduleSchema;
