import { BridgeAttributeMeta } from '../types';

const bridgeAttributesMap = {
  /**
   * The entry point for the bridge, used to identify the source of the session and for logging purposes.
   */
  'entry-point': new BridgeAttributeMeta({
    key: 'entry-point',
    type: 'string',
    default: '',
  }),

  /**
   * If provided joins directly to the session with the provided session identifier, otherwise a new session may be created
   */
  'session-identifier': new BridgeAttributeMeta({
    key: 'session-identifier',
    type: 'string',
    default: '',
  }),
} as const;

export default bridgeAttributesMap;
