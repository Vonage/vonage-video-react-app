import type { ApplicationHandler } from '@common/routing/types';
import VonageVera from './VonageVera';

/**
 * Creates a VonageVera handler with everything required to respond to a VeraApp request
 */
const createVonageHandler = (
  ...args: ConstructorParameters<typeof VonageVera>
): ApplicationHandler => {
  return new VonageVera(...args).getHandler();
};

export default createVonageHandler;
