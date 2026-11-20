export const testIds = {
  startTime: 'create-meeting-start-time',
  duration: (minutes: number) => `create-meeting-duration-${minutes}`,
} as const;
