import { describe, it, expect } from 'vitest';
import { VALID_SESSION_ID } from '@common-test/fixtures';
import assertSessionId from '.';

describe('assertSessionId', () => {
  it('should not throw for a valid session ID', () => {
    expect(() => assertSessionId(VALID_SESSION_ID)).not.toThrow();
  });

  it('should throw for invalid values', () => {
    expect(() => assertSessionId('invalid-session-id')).toThrow();
    expect(() => assertSessionId(null)).toThrow();
    expect(() => assertSessionId(undefined)).toThrow();
  });
});
