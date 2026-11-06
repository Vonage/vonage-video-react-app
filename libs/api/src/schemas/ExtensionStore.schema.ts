import z from 'zod';
import { isFunction, isRecord } from '@common/assertions';
import type { ExtensionStore } from '@api-lib/types/ExtensionStore';

export const ExtensionStoreSchema = z.custom<ExtensionStore>(
  (value) => isRecord(value) && isFunction(value.commitExtension),
  { message: 'The extension store must implement commitExtension' }
);

export default ExtensionStoreSchema;
