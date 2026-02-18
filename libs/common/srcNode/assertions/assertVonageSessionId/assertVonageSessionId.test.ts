import { VALID_SESSION_ID, INVALID_SESSION_IDS } from '@common-test/fixtures';
import assertVonageSessionId from '.';

describe('assertVonageSessionId', () => {
  it('should not throw for a valid session ID', () => {
    expect(() => assertVonageSessionId(VALID_SESSION_ID)).not.toThrow();
  });

  it('should throw for an empty string', () => {
    expect(() => assertVonageSessionId(INVALID_SESSION_IDS.empty)).toThrow(
      'Invalid sessionId format'
    );
  });

  it('should throw for a session ID without underscore separator', () => {
    expect(() => assertVonageSessionId(INVALID_SESSION_IDS.noUnderscore)).toThrow(
      'Invalid sessionId format'
    );
  });

  it('should throw for a session ID with multiple underscores', () => {
    expect(() => assertVonageSessionId(INVALID_SESSION_IDS.multipleUnderscores)).toThrow(
      'Invalid sessionId format'
    );
  });

  it('should throw for a session ID with too few decoded fields', () => {
    expect(() => assertVonageSessionId(INVALID_SESSION_IDS.tooFewFields)).toThrow(
      'Invalid sessionId format'
    );
  });

  it('should throw for null', () => {
    expect(() => assertVonageSessionId(null)).toThrow();
  });

  it('should throw for undefined', () => {
    expect(() => assertVonageSessionId(undefined)).toThrow();
  });
});
