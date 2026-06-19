import assertResult from '@common/execution/assertResult';
import { assertNotNil, assertNumericString, isNumber } from '@common/assertions';
import { ApplicationClientError } from '@core/errors';

export type MetricFormatArgs = {
  locales?: Intl.LocalesArgument;
  options?: Intl.NumberFormatOptions;
};

export interface IMetricValue<TValue = number> {
  /**
   * The name of the metric value, used for identification and error reporting.
   */
  readonly name: string;

  /**
   * The value of the metric.
   */
  readonly value: TValue;

  /**
   * Returns a string representation of the metric value, formatted according to the specified locales and options.
   */
  toString(): string;
}

export abstract class MetricValue implements IMetricValue<number> {
  public readonly name: string;

  public readonly value: number;

  protected readonly locales?: Intl.LocalesArgument;
  protected readonly options?: Intl.NumberFormatOptions;

  private _stringValue: string | null = null;

  constructor(args: {
    name: string;
    value: number | string;
    locales?: Intl.LocalesArgument;
    options?: Intl.NumberFormatOptions;
  }) {
    this.name = args.name;
    this.value = this.readInitialValue(args.value);

    this.locales = args.locales;
    this.options = {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...args.options,
    };
  }

  public get stringValue(): string {
    return this.toString();
  }

  public toString(): string {
    if (this._stringValue === null) {
      this._stringValue = this.formatMetricValue();
    }

    return this._stringValue;
  }

  protected abstract formatMetricValue(): string;

  protected readInitialValue(value: number | string): number {
    return assertResult(
      () => {
        assertNotNil(value, `${this.name}: value cannot be null or undefined`);

        if (isNumber(value)) {
          return value;
        }

        assertNumericString(value, `${this.name}: ${value} is not a valid number string`);

        return Number(value.trim());
      },
      (error) =>
        new ApplicationClientError({
          src: error,
          fallbackConfig: {
            fallbackMessage: `${this.name}: Invalid value`,
          },
        })
    );
  }

  protected formatNumber(value = this.value, options = this.options): string {
    return new Intl.NumberFormat(this.locales, options).format(value);
  }

  protected formatInteger(value = this.value): string {
    return this.formatNumber(value, {
      maximumFractionDigits: 0,
    });
  }
}

export default MetricValue;
