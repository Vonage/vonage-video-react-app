import MetricValue, { type MetricFormatArgs } from '../MetricValue/MetricValue';

export class DefaultMetricValue extends MetricValue {
  constructor(value: number | string, args?: MetricFormatArgs) {
    super({ name: 'DefaultMetricValue', value, ...args });
  }

  protected override formatMetricValue(): string {
    return this.formatNumber();
  }
}

export function metricValue(value: number | string, args?: MetricFormatArgs): DefaultMetricValue {
  return new DefaultMetricValue(value, args);
}

export default DefaultMetricValue;
