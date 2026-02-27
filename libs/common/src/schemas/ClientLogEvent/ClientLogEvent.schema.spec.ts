import { describe, expect, it } from 'vitest';
import { ClientLogEventSchema } from './ClientLogEvent.schema';

const validEvent = {
  action: 'EnterMeeting',
  clientSystemTime: Date.now(),
  source: 'https://example.com',
  guid: crypto.randomUUID(),
  level: 'info' as const,
  userAgent: 'Mozilla/5.0',
};

describe('ClientLogEventSchema', () => {
  it('accepts valid minimal payload', () => {
    expect(ClientLogEventSchema.safeParse(validEvent).success).toBe(true);
  });

  it('accepts payload with optional fields', () => {
    const full = {
      ...validEvent,
      variation: 'Success',
      sessionId: 's1',
      connectionId: 'c1',
      partnerId: 'apiKey',
      payload: { key: 'value' },
      clientVersion: '1.0',
      sdkId: '2.0',
      componentId: 'vera',
      logVersion: '2',
      name: 'vera',
    };
    expect(ClientLogEventSchema.safeParse(full).success).toBe(true);
  });

  it('rejects missing required action', () => {
    const { action: _, ...rest } = validEvent;
    expect(ClientLogEventSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects empty action', () => {
    expect(ClientLogEventSchema.safeParse({ ...validEvent, action: '' }).success).toBe(false);
  });

  it('rejects invalid level', () => {
    expect(ClientLogEventSchema.safeParse({ ...validEvent, level: 'warn' }).success).toBe(false);
  });

  it('rejects missing guid', () => {
    const { guid: _, ...rest } = validEvent;
    expect(ClientLogEventSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects clientSystemTime as string', () => {
    expect(ClientLogEventSchema.safeParse({ ...validEvent, clientSystemTime: '123' }).success).toBe(
      false
    );
  });
});
