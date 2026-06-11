import type { MetricFormatArgs } from '../MetricValue/MetricValue';

export type OptionalMetricFormatArgs = MetricFormatArgs & {
  fallback?: string;
};

type ValueConstructor<TResult, TValue> = new (value: TValue, args?: MetricFormatArgs) => TResult;

export type OptionalValueFallback = {
  value: null;
  toString(): string;
};

export type OptionalValue<TResult extends { value: unknown }> =
  | (TResult & TResult['value'])
  | OptionalValueFallback;

export function optionalValue<TResult extends { value: unknown }, TValue>(
  ValueClass: ValueConstructor<TResult, TValue>,
  value: TValue | null,
  args?: OptionalMetricFormatArgs
): OptionalValue<TResult> {
  if (value === null) {
    const fallback = args?.fallback ?? '';

    return {
      value: null,
      toString: () => fallback,
    };
  }

  return new ValueClass(value, args) as TResult & { value: TValue };
}

export default optionalValue;
