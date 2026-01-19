import { describe, it, expect } from 'vitest';
import { VALID_SESSION_ID, INVALID_SESSION_IDS } from '@common-test/fixtures';
import assertSessionId from '.';

describe('assertSessionId', () => {
  it('should not throw for a valid session ID', () => {
    expect(() => assertSessionId(VALID_SESSION_ID)).not.toThrow();
  });

  it('should throw for an empty string', () => {
    expect(() => assertSessionId(INVALID_SESSION_IDS.empty)).toThrow('Invalid sessionId format');
  });

  it('should throw for a session ID without underscore separator', () => {
    expect(() => assertSessionId(INVALID_SESSION_IDS.noUnderscore)).toThrow(
      'Invalid sessionId format'
    );
  });

  it('should throw for a session ID with multiple underscores', () => {
    expect(() => assertSessionId(INVALID_SESSION_IDS.multipleUnderscores)).toThrow(
      'Invalid sessionId format'
    );
  });

  it('should throw for a session ID with too few decoded fields', () => {
    expect(() => assertSessionId(INVALID_SESSION_IDS.tooFewFields)).toThrow(
      'Invalid sessionId format'
    );
  });

  it('should throw for null', () => {
    expect(() => assertSessionId(null)).toThrow();
  });

  it('should throw for undefined', () => {
    expect(() => assertSessionId(undefined)).toThrow();
  });
});
