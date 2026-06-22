import { isNil, isRecord } from '@common/assertions';
import {
  type IMetricValue,
  type MetricFormatArgs as MetricFormatArgsBase,
} from '../MetricValue/MetricValue';
import { Any } from '@common/types';

type MetricFormatArgs = MetricFormatArgsBase & {
  fallback?: string;
};

type IMetricClass<Metric extends IMetricValue<Any>> = new (
  value: Metric['value'],
  args?: MetricFormatArgs
) => Metric;

class OptionalValue<Metric extends IMetricValue<Any>> implements IMetricValue<Metric | null> {
  public readonly name = 'OptionalValue';

  public readonly fallback: string = '';

  public readonly metric: Metric | null;

  public get value(): Metric['value'] | null {
    if (isNil(this.metric)) return null;
    return this.metric.value as Metric['value'];
  }

  constructor(metric: IMetricClass<Metric>, args?: MetricFormatArgs);

  constructor(
    MetricClass: IMetricClass<Metric>,
    value: Metric['value'] | null | undefined,
    args?: MetricFormatArgs
  );

  constructor(
    arg1: IMetricClass<Metric> | Metric['value'] | null | undefined,
    arg2?: Metric['value'] | MetricFormatArgs | null,
    arg3?: MetricFormatArgs
  ) {
    const isMetricValue =
      isRecord(arg1) && Object.hasOwn(arg1, 'value') && Object.hasOwn(arg1, 'toString');

    const args = (isMetricValue ? arg2 : arg3) as MetricFormatArgs | undefined;

    const metric = (() => {
      if (isMetricValue) return arg1 as Metric;

      const MetricClass = arg1 as IMetricClass<Metric>;
      const value = arg2 as Metric['value'] | null | undefined;

      if (isNil(value)) return null;

      return new MetricClass(value, args);
    })();

    this.metric = metric;
    this.fallback = args?.fallback ?? '';
  }

  toString(): string {
    if (isNil(this.metric)) return this.fallback;
    return this.metric.toString();
  }
}

/**
 * Creates an instance of `OptionalValue` for the specified metric class and value.
 */
export function optionalValue<Metric extends IMetricValue<Any>>(
  metric: IMetricClass<Metric>,
  args?: MetricFormatArgs
): OptionalValue<Metric>;

/**
 * Creates an instance of `OptionalValue` for the specified metric.
 */
export function optionalValue<Metric extends IMetricValue<Any>>(
  MetricClass: IMetricClass<Metric>,
  value: Metric['value'] | null | undefined,
  args?: MetricFormatArgs
): OptionalValue<Metric>;

export function optionalValue<Metric extends IMetricValue<Any>>(
  ...args: ConstructorParameters<typeof OptionalValue<Metric>>
) {
  return new OptionalValue(...args);
}

export default OptionalValue;
