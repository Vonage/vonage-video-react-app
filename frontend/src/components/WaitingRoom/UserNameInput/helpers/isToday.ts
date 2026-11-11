function isToday({ timestamp, now }: { timestamp: number; now: number }): boolean {
  return new Date(timestamp).toDateString() === new Date(now).toDateString();
}

export default isToday;
