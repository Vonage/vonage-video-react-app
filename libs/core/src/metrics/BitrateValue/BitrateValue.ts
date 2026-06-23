import MetricValue, { type MetricFormatArgs, type IMetricValue } from '../MetricValue';

const emptyValue = '–';

export class BitrateValue extends MetricValue implements IMetricValue {
  constructor(value: number | string, args?: MetricFormatArgs) {
    super({ name: 'BitrateValue', value, ...args });
  }

  protected override formatMetricValue(): string {
    if (this.value <= 0) {
      return emptyValue;
    }

    if (this.value < 1000) {
      return `${this.formatInteger(Math.round(this.value))} bps`;
    }

    if (this.value < 1000 * 1000) {
      return `${this.formatNumber(this.value / 1000, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} kbps`;
    }

    return `${this.formatNumber(this.value / (1000 * 1000), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} Mbps`;
  }
}

export function bitrateValue(value: number | string, args?: MetricFormatArgs): BitrateValue {
  return new BitrateValue(value, args);
}

export default BitrateValue;
