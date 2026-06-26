import { type MetricFormatArgs, type IMetricValue } from '../MetricValue';

import type { NetworkConditionReason } from '@vonage/client-sdk-video';

export class NetworkConditionReasonValue implements IMetricValue<NetworkConditionReason | null> {
  public readonly name = 'NetworkConditionReasonValue';

  public readonly value: NetworkConditionReason | null;

  constructor(reason: NetworkConditionReason | null, _args?: MetricFormatArgs) {
    this.value = reason;
  }

  public get stringValue(): string {
    return this.toString();
  }

  public toString(): string {
    if (this.value === null) {
      return '–';
    }

    return this.value;
  }
}

export function networkConditionReasonValue(
  value: NetworkConditionReason | null,
  args?: MetricFormatArgs
): NetworkConditionReasonValue {
  return new NetworkConditionReasonValue(value, args);
}

export default NetworkConditionReasonValue;
