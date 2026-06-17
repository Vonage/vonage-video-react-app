import MetricValue, { type MetricFormatArgs, type IMetricValue } from '../MetricValue';

export class BytesValue extends MetricValue implements IMetricValue {
  constructor(value: number | string, args?: MetricFormatArgs) {
    super({ name: 'BytesValue', value, ...args });
  }

  protected override formatMetricValue(): string {
    if (this.value < 1024) {
      return `${this.formatInteger()} B`;
    }

    if (this.value < 1024 * 1024) {
      return `${this.formatNumber(this.value / 1024, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} KB`;
    }

    if (this.value < 1024 * 1024 * 1024) {
      return `${this.formatNumber(this.value / (1024 * 1024), {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} MB`;
    }

    return `${this.formatNumber(this.value / (1024 * 1024 * 1024), {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} GB`;
  }
}

export function bytesValue(value: number | string, args?: MetricFormatArgs): BytesValue {
  return new BytesValue(value, args);
}

export default BytesValue;
