import tryCatch from '@common/execution/tryCatch';
import isErrorLike from '@common/assertions/isErrorLike';
import type { ClientLogEvent } from '@common/logger';

type Primitive = string | number | boolean | null;

function serializeValue(value: unknown): Primitive | Record<string, unknown> {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null
  ) {
    return value;
  }

  if (isErrorLike(value)) {
    return {
      message: value.message,
      name: (value as Error).name ?? 'Error',
      stack: (value as Error).stack,
    };
  }

  const { result: stringified } = tryCatch(() => JSON.stringify(value), '[unserializable]');
  return stringified ?? '[unserializable]';
}

/**
 * Makes event.payload JSON-serializable: Errors → { message, name, stack }; objects/arrays → JSON string;
 * circular refs → '[unserializable]'. Returns event unchanged if payload is absent.
 */
export function serializeClientEvent(event: ClientLogEvent): ClientLogEvent {
  if (!event.payload) return event;

  const payload: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(event.payload)) {
    payload[k] = serializeValue(v);
  }

  return {
    ...event,
    payload: payload as ClientLogEvent['payload'],
  };
}
