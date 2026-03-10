import { z } from 'zod';
import { bridgeAttributes } from '../constants';
import type { BridgeAttribute } from '../types';

const bridgeAttributeSchema: z.ZodType<BridgeAttribute> = z.enum(bridgeAttributes);

export function assertBridgeAttribute(value: unknown): asserts value is BridgeAttribute {
  bridgeAttributeSchema.parse(value);
}

export function isBridgeAttribute(value: unknown): value is BridgeAttribute {
  return bridgeAttributeSchema.safeParse(value).success;
}

export default bridgeAttributeSchema;
