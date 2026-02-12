import { describe, it, expect } from 'vitest';
import { parseExtra } from './parseExtras';

describe('parseExtra', () => {
  it('extracts sessionId, connectionId, timestamp, partnerId and puts rest in payload', () => {
    const result = parseExtra({
      sessionId: 'sid-1',
      connectionId: 'conn-1',
      timestamp: 1234567890,
      partnerId: 'apiKey',
      custom: 'data',
      other: 42,
    });

    expect(result).toEqual({
      sessionId: 'sid-1',
      connectionId: 'conn-1',
      timestamp: 1234567890,
      partnerId: 'apiKey',
      payload: { custom: 'data', other: 42 },
    });
  });

  it('returns undefined for sessionId/connectionId/timestamp/partnerId when wrong type', () => {
    const result = parseExtra({
      sessionId: 123,
      connectionId: null,
      timestamp: 'not-a-number',
      partnerId: undefined,
    });

    expect(result.sessionId).toBeUndefined();
    expect(result.connectionId).toBeUndefined();
    expect(result.timestamp).toBeUndefined();
    expect(result.partnerId).toBeUndefined();
    expect(result.payload).toBeUndefined();
  });

  it('returns undefined payload when extra has only reserved keys', () => {
    const result = parseExtra({
      sessionId: 's',
      connectionId: 'c',
      timestamp: 1,
      partnerId: 'p',
    });

    expect(result.payload).toBeUndefined();
  });

  it('handles undefined extra', () => {
    const result = parseExtra(undefined);

    expect(result).toEqual({
      sessionId: undefined,
      connectionId: undefined,
      timestamp: undefined,
      partnerId: undefined,
      payload: undefined,
    });
  });

  it('handles empty object', () => {
    const result = parseExtra({});

    expect(result.sessionId).toBeUndefined();
    expect(result.connectionId).toBeUndefined();
    expect(result.timestamp).toBeUndefined();
    expect(result.partnerId).toBeUndefined();
    expect(result.payload).toBeUndefined();
  });
});
