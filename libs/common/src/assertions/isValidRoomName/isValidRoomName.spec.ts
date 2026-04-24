import { describe, it, expect } from 'vitest';
import isValidRoomName from './isValidRoomName';

describe('isValidRoomName', () => {
  const testCases = [
    { input: 'room_name', expected: true },
    { input: 'room+name', expected: true },
    { input: 'another-room_name', expected: true },
    { input: '123roomname', expected: true },
    { input: 'room@name', expected: false },
    { input: 'room#name', expected: false },
    { input: 'room$name', expected: false },
    { input: '', expected: false },
    { input: 'a'.repeat(100), expected: true },
    { input: 'a'.repeat(101), expected: false },
    { input: 'room-name_123+test', expected: true },
  ];

  testCases.forEach(({ input, expected }) => {
    const displayInput =
      input.length > 50 ? `${input.substring(0, 50)}...` : input || '(empty string)';
    it(`should return ${expected} for "${displayInput}"`, () => {
      const result = isValidRoomName(input);
      expect(result).toBe(expected);
    });
  });
});
