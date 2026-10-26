import type { KebabToCamel } from '@common/types';
import type { VideoClient } from '@core/services';
import bridgeAttributesMap from './bridgeAttributesMap';

function initialValue() {
  const htmlAttributes: {
    [Key in keyof typeof bridgeAttributesMap as KebabToCamel<Key>]: string;
  } = {
    entryPoint: bridgeAttributesMap['entry-point'].value,
    sessionIdentifier: bridgeAttributesMap['session-identifier'].value,
    language: bridgeAttributesMap['language'].value,
    credentials: bridgeAttributesMap['credentials'].value,
  };

  return {
    ...htmlAttributes,
    /** Set through the element's `videoClient` property; takes precedence over the attributes. */
    videoClient: null as VideoClient | null,
  };
}

export default initialValue;
