import type { DevicesAPI } from '../types';
import { createStoreApiAssertion } from '@web/assertions';

const assertion = createStoreApiAssertion<DevicesAPI>('DevicesStore');

export function assertDevicesAPI(value: unknown): asserts value is DevicesAPI {
  assertion.assertion(value);
}

export const markDevicesApiMetadata = assertion.mark;

export default assertDevicesAPI;
