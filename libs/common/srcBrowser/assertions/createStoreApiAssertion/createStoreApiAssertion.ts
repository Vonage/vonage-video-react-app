import type { Any, StoreTools } from 'react-global-state-hooks';
import assertRecord from '../../../src/assertions/assertRecord';
import isNil from '../../../src/assertions/isNil';

/**
 * Creates a type-safe assertion function and metadata marker store APIs.
 *
 * This factory generates a branded assertion that validates store API instances at runtime,
 * ensuring type safety without manual casting while maintaining 100% predictability.
 *
 * @template T - The store API type extending StoreTools
 * @param storeName - Name of the store for error messages (e.g., 'DevicesStore')
 *
 * @returns A tuple containing:
 * - `assertion`: Function that asserts a value is the correct store API type
 * - `markMetadata`: Function that adds the brand to store metadata
 *
 * @example
 * ```ts
 * // Define the store API type
 * type DevicesAPI = InferAPI<typeof devicesStore>;
 *
 * // Create assertion and marker
 * const [assertDevicesAPI, markDevicesAPI] = createStoreApiAssertion<DevicesAPI>('DevicesStore');
 *
 * // Mark the store metadata
 * markDevicesAPI(metadata);
 *
 * // Use the assertion to validate and narrow types
 * function handleStoreAPI(api: unknown) {
 *   assertDevicesAPI(api);
 *   // Type is now narrowed to DevicesAPI
 *   const state = api.getState();
 * }
 * ```
 */
const createStoreApiAssertion = <T extends StoreTools<Any, Any, Any>>(storeName: string) => {
  const __brand: symbol = Symbol(`${storeName} marker`);

  function assertion(value: unknown) {
    assertRecord(value, `value should be an object for ${storeName} assertion`);

    const api = value as T;

    if (isNil(api.getMetadata) || !api.getMetadata()[__brand]) {
      throw new TypeError(`value metadata does not have the correct ${storeName} brand`);
    }
  }

  const mark = (metadata: ReturnType<T['getMetadata']>) => {
    Object.assign(metadata, { [__brand]: true });
  };

  return { assertion, mark } as const;
};

export default createStoreApiAssertion;
