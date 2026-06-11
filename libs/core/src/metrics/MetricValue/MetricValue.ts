import assertResult from '@common/execution/assertResult';
import { assertNotNil, isString } from '@common/assertions';
import { ApplicationClientError } from '@core/errors';

export type MetricFormatArgs = {
  locales?: Intl.LocalesArgument;
  options?: Intl.NumberFormatOptions;
};

export abstract class MetricValue {
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

        if (typeof value === 'number') {
          if (!isNumber(value)) {
            throw new TypeError(`${this.name}: ${value} is not a finite number`);
          }

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

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNumericString(value: unknown): value is string {
  if (!isString(value)) {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  return Number.isFinite(Number(trimmed));
}

function assertNumericString(value: unknown, message?: string): asserts value is string {
  if (!isNumericString(value)) {
    throw new TypeError(message ?? `${String(value)} is not a valid number string`);
  }
}
