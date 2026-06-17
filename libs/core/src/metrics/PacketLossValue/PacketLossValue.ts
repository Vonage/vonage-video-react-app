import MetricValue, { type MetricFormatArgs, type IMetricValue } from '../MetricValue/MetricValue';

export class PacketLossValue extends MetricValue implements IMetricValue {
  constructor(value: number | string, args?: MetricFormatArgs) {
    super({ name: 'PacketLossValue', value, ...args });
  }

  protected override formatMetricValue(): string {
    return `${this.formatNumber(this.value * 100, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}%`;
  }
}

export function packetLossValue(value: number | string, args?: MetricFormatArgs): PacketLossValue {
  return new PacketLossValue(value, args);
}

export default PacketLossValue;
