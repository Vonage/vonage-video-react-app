import MetricValue, { type MetricFormatArgs } from '../MetricValue/MetricValue';

const emptyValue = '–';

export class FrameRateValue extends MetricValue {
  constructor(value: number | string, args?: MetricFormatArgs) {
    super({ name: 'FrameRateValue', value, ...args });
  }

  protected override formatMetricValue(): string {
    if (this.value <= 0) {
      return emptyValue;
    }

    return `${this.formatInteger(Math.round(this.value))} fps`;
  }
}

export function frameRateValue(value: number | string, args?: MetricFormatArgs): FrameRateValue {
  return new FrameRateValue(value, args);
}

export default FrameRateValue;
