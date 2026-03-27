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

  /**
   * BCP-47 language tag for the UI locale (e.g. 'en', 'es', 'it').
   * Falls back to the browser's detected language when not provided.
   */
  language: new BridgeAttributeMeta({
    key: 'language',
    type: 'string',
    default: '',
  }),
} as const;

export default bridgeAttributesMap;
