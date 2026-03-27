import type { KebabToCamel } from '@common/types';
import bridgeAttributesMap from './bridgeAttributesMap';

function initialValue() {
  const htmlAttributes: {
    [Key in keyof typeof bridgeAttributesMap as KebabToCamel<Key>]: string;
  } = {
    entryPoint: bridgeAttributesMap['entry-point'].value,
    sessionIdentifier: bridgeAttributesMap['session-identifier'].value,
    language: bridgeAttributesMap['language'].value,
  };

  return {
    ...htmlAttributes,
  };
}

export default initialValue;
