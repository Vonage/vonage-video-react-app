import VonageVera from './VonageVera';

/**
 * Creates a VonageVera handler with everything required to respond to a VeraApp request
 */
const createVonageHandler = (...args: ConstructorParameters<typeof VonageVera>) => {
  return new VonageVera(...args).getHandler();
};

export default createVonageHandler;
