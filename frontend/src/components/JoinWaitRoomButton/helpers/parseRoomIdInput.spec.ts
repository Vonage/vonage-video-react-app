import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import parseRoomIdInput from './parseRoomIdInput';

const sessionId = '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE';
const sessionKey = jwt.sign({ sessionId, roomName: 'test-room' }, 'test');

describe('parseRoomIdInput', () => {
  it.each([
    { input: `  ${sessionKey}  `, expected: sessionKey },
    { input: 'My-Room', expected: 'my-room' },
    { input: `https://vera.example.com/waiting-room/${sessionKey}`, expected: null },
    { input: 'invalid room', expected: null },
    { input: '', expected: null },
  ])('resolves "$input" to $expected', ({ input, expected }) => {
    expect(parseRoomIdInput(input)).toBe(expected);
  });
});
