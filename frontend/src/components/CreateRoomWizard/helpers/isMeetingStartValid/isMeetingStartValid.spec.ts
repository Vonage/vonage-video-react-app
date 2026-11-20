import { expect, it } from 'vitest';
import isMeetingStartValid from './isMeetingStartValid';

it('accepts a start in the current minute or later, and rejects an earlier or empty one', () => {
  const now = new Date(2030, 0, 15, 9, 30, 45).getTime();

  expect(isMeetingStartValid({ startDate: '2030-01-15', startTime: '09:30', now })).toBe(true);
  expect(isMeetingStartValid({ startDate: '2030-01-16', startTime: '08:00', now })).toBe(true);
  expect(isMeetingStartValid({ startDate: '2030-01-15', startTime: '09:29', now })).toBe(false);
  expect(isMeetingStartValid({ startDate: '', startTime: '09:30', now })).toBe(false);
});
