import { describe, it, expect } from 'vitest';
import decodeJwt from './decodeJwt';

const validJwt = [
  btoa(JSON.stringify({ alg: 'none' })),
  btoa(JSON.stringify({ sessionId: 'some-session-id', roomName: 'my-room' })),
  'mock-sig',
].join('.');

describe('decodeJwt', () => {
  it('should decode a valid JWT payload', () => {
    const result = decodeJwt<{ sessionId: string; roomName: string }>(validJwt);

    expect(result).toEqual({
      sessionId: 'some-session-id',
      roomName: 'my-room',
    });
  });

  it('should throw for a string without three dot-separated parts', () => {
    expect(() => decodeJwt('invalidToken')).toThrow('Invalid token format');
  });

  it('should throw for an empty string', () => {
    expect(() => decodeJwt('')).toThrow('Invalid token format');
  });

  it('should throw for a token with invalid base64 payload', () => {
    expect(() => decodeJwt('a.!!invalid!!.c')).toThrow();
  });
});
