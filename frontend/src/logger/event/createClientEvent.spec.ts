import { vi, describe, it, expect } from 'vitest';
import { createClientEvent } from './createClientEvent';

const { MOCK_VERSION } = vi.hoisted(() => ({
  MOCK_VERSION: 'vera-1.0.0-test',
}));

vi.mock('@utils/getAppVersion', () => ({
  default: () => MOCK_VERSION,
}));

describe('createClientEvent', () => {
  it('returns a ClientLogEvent with required fields', () => {
    const event = createClientEvent({
      level: 'info',
      action: 'TestAction',
      payload: { key: 'value' },
      session: { sessionId: 'sid-1', connectionId: 'conn-1', partnerId: 'partner-123' },
      timestamp: 1234567890,
    });

    expect(event).toMatchObject({
      action: 'TestAction',
      payload: { key: 'value' },
      session: { sessionId: 'sid-1', connectionId: 'conn-1', partnerId: 'partner-123' },
      sessionId: 'sid-1',
      connectionId: 'conn-1',
      partnerId: 'partner-123',
      clientSystemTime: 1234567890,
      level: 'info',
    });
    expect(event.guid).toBeDefined();
    expect(typeof event.guid).toBe('string');
    expect(event.userAgent).toBeDefined();
    expect(typeof event.userAgent).toBe('string');
  });

  it('uses Date.now() when clientSystemTime is not provided', () => {
    const before = Date.now();
    const event = createClientEvent({
      level: 'info',
      action: 'A',
      session: { sessionId: 'sid-1', connectionId: 'conn-1' },
    });
    const after = Date.now();

    expect(event.clientSystemTime).toBeGreaterThanOrEqual(before);
    expect(event.clientSystemTime).toBeLessThanOrEqual(after);
  });

  it('sets clientVersion, source, name and componentId from app/env', () => {
    const event = createClientEvent({
      level: 'error',
      action: 'Error',
      payload: {},
      session: { sessionId: 'sid-1', connectionId: 'conn-1', partnerId: 'partner-123' },
    });

    expect(event.clientVersion).toBe(MOCK_VERSION);
    expect(event.source).toBeDefined();
    expect(event.name).toBe('vera');
    expect(event.componentId).toBe('vera');
  });

  it('carries userId inside session and mirrors it to referrer', () => {
    const event = createClientEvent({
      level: 'info',
      action: 'TestAction',
      session: { userId: 'user-123' },
    });

    expect(event.session).toEqual({ userId: 'user-123' });
    expect(event.referrer).toBe('user-123');
  });

  it('leaves session undefined when not provided, so it is dropped on serialization', () => {
    const event = createClientEvent({
      level: 'info',
      action: 'TestAction',
      payload: { key: 'value' },
    });

    expect(event.session).toBeUndefined();
    expect(JSON.parse(JSON.stringify(event))).not.toHaveProperty('session');
    expect(event).not.toHaveProperty('sessionId');
    expect(event).not.toHaveProperty('connectionId');
    expect(event).not.toHaveProperty('partnerId');
    expect(event).not.toHaveProperty('referrer');
  });

  it('uses the same guid for all events from the same module (same page load)', () => {
    const event1 = createClientEvent({
      level: 'info',
      action: 'Error',
      session: { sessionId: 'sid-1', connectionId: 'conn-1' },
    });
    const event2 = createClientEvent({
      level: 'info',
      action: 'Error',
      session: { sessionId: 'sid-1', connectionId: 'conn-1' },
      timestamp: 1234567890,
    });

    expect(event1.guid).toBe(event2.guid);
  });
});
