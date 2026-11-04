import z from 'zod';

export const MeetingScheduleSchema = z.object({
  startsAt: z
    .number()
    .int()
    .positive()
    .max(8_640_000_000_000_000)
    .describe('Start time in Unix epoch milliseconds'),
  durationMinutes: z.number().int().positive(),
});

export type MeetingSchedule = z.infer<typeof MeetingScheduleSchema>;

export default MeetingScheduleSchema;
