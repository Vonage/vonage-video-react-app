import MetricValue, { type MetricFormatArgs, type IMetricValue } from '../MetricValue/MetricValue';

export class IntegerValue extends MetricValue implements IMetricValue {
  constructor(value: number | string, args?: MetricFormatArgs) {
    super({ name: 'IntegerValue', value, ...args });
  }

  protected override formatMetricValue(): string {
    return this.formatInteger();
  }
}

export function integerValue(value: number | string, args?: MetricFormatArgs): IntegerValue {
  return new IntegerValue(value, args);
}

export default IntegerValue;
