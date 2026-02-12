import { describe, it, expect } from 'vitest';
import { serializeClientEvent } from './serializeClientEvent';
import type { ClientLogEvent } from '@common/logger';

const createBaseEvent = (): ClientLogEvent => ({
  action: 'TestAction',
  level: 'info',
  clientSystemTime: Date.now(),
  userAgent: 'Mozilla/5.0',
  guid: 'guid-1',
  source: 'test-source',
});

describe('serializeClientEvent', () => {
  it('returns event as-is when payload is undefined', () => {
    const event = createBaseEvent();

    const result = serializeClientEvent(event);

    expect(result).toBe(event);
    expect(result.payload).toBeUndefined();
  });

  it('normalizes payload: null to undefined so backend never receives invalid null', () => {
    const event = { ...createBaseEvent(), payload: null } as unknown as ClientLogEvent;

    const result = serializeClientEvent(event);

    expect(result.payload).toBeUndefined();
    expect(result.action).toBe(event.action);
    expect(result.guid).toBe(event.guid);
  });

  it('serializes primitive values in payload unchanged', () => {
    const event = {
      ...createBaseEvent(),
      payload: {
        str: 'hello',
        num: 42,
        bool: true,
        nil: null,
      },
    } as ClientLogEvent;

    const result = serializeClientEvent(event);

    expect(result.payload).toEqual({
      str: 'hello',
      num: 42,
      bool: true,
      nil: null,
    });
  });

  it('serializes Error instances to { message, name, stack }', () => {
    const err = new Error('Something broke');
    const event = {
      ...createBaseEvent(),
      payload: { error: err },
    } as unknown as ClientLogEvent;

    const result = serializeClientEvent(event);

    expect(result.payload).toEqual({
      error: {
        message: 'Something broke',
        name: 'Error',
        stack: err.stack,
      },
    });
  });

  it('serializes plain objects to JSON string', () => {
    const event = {
      ...createBaseEvent(),
      payload: { nested: { foo: 'bar', count: 1 } },
    } as unknown as ClientLogEvent;

    const result = serializeClientEvent(event);

    expect(result.payload).toEqual({
      nested: '{"foo":"bar","count":1}',
    });
  });

  it('serializes arrays to JSON string', () => {
    const event = {
      ...createBaseEvent(),
      payload: { items: ['a', 'b', 'c'] },
    } as unknown as ClientLogEvent;

    const result = serializeClientEvent(event);

    expect(result.payload).toEqual({
      items: '["a","b","c"]',
    });
  });

  it("returns [unserializable] for values that cannot be JSON.stringify'd", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    const event = {
      ...createBaseEvent(),
      payload: { circular },
    } as unknown as ClientLogEvent;

    const result = serializeClientEvent(event);

    expect(result.payload).toEqual({
      circular: '[unserializable]',
    });
  });

  it('preserves other event fields when serializing payload', () => {
    const event = {
      ...createBaseEvent(),
      sessionId: 's1',
      connectionId: 'c1',
      payload: { key: 'value' },
    } as ClientLogEvent;

    const result = serializeClientEvent(event);

    expect(result.action).toBe('TestAction');
    expect(result.sessionId).toBe('s1');
    expect(result.connectionId).toBe('c1');
    expect(result.payload).toEqual({ key: 'value' });
  });

  it('serializes mixed payload values correctly', () => {
    const err = new TypeError('Type error');
    const event = {
      ...createBaseEvent(),
      payload: { str: 'text', num: 99, err, obj: { x: 1 } },
    } as unknown as ClientLogEvent;

    const result = serializeClientEvent(event);

    expect(result.payload).toEqual({
      str: 'text',
      num: 99,
      err: {
        message: 'Type error',
        name: 'TypeError',
        stack: err.stack,
      },
      obj: '{"x":1}',
    });
  });
});
