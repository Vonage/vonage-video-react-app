import MetricValue, { type MetricFormatArgs, type IMetricValue } from '../MetricValue';

export class DurationValue extends MetricValue implements IMetricValue {
  constructor(value: number | string, args?: MetricFormatArgs) {
    super({ name: 'DurationValue', value, ...args });
  }

  protected override formatMetricValue(): string {
    if (this.value < 1000) {
      return `${this.formatInteger()} ms`;
    }

    return `${this.formatNumber(this.value / 1000, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} s`;
  }
}

export function durationValue(value: number | string, args?: MetricFormatArgs): DurationValue {
  return new DurationValue(value, args);
}

export default DurationValue;
