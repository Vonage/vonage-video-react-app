import { type MetricFormatArgs, type IMetricValue } from '../MetricValue';

import type { NetworkCondition as OTNetworkCondition } from '@vonage/client-sdk-video';

export class NetworkConditionValue implements IMetricValue<OTNetworkCondition | null> {
  public readonly name = 'NetworkConditionValue';

  public readonly value: OTNetworkCondition | null;

  constructor(networkCondition: OTNetworkCondition | null, _args?: MetricFormatArgs) {
    this.value = networkCondition;
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

export function networkConditionValue(
  value: OTNetworkCondition | null,
  args?: MetricFormatArgs
): NetworkConditionValue {
  return new NetworkConditionValue(value, args);
}

export default NetworkConditionValue;
