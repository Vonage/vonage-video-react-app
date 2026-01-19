import type { KebabToCamel } from '@common/types';
import type BridgeAttribute from './BridgeAttribute';
import type BridgeAttributeType from './BridgeAttributeType';
import { kebabToCamel } from '@common/helpers';

/**
 * HTML Attribute metadata
 */
export class BridgeAttributeMeta<
  Attribute extends BridgeAttribute,
  Type extends BridgeAttributeType,
> {
  htmlKey: Attribute;
  name: KebabToCamel<Attribute>;
  value: string;
  type: Type;

  constructor(args: { key: Attribute; default: string; type: Type }) {
    this.htmlKey = args.key;
    this.name = kebabToCamel(args.key) as KebabToCamel<Attribute>;
    this.value = args.default;
    this.type = args.type;
  }
}

export default BridgeAttributeMeta;
