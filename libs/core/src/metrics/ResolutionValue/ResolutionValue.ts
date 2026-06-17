import type { IMetricValue, MetricFormatArgs } from '../MetricValue/MetricValue';

export type Resolution = {
  width: number | null;
  height: number | null;
};

export class ResolutionValue implements IMetricValue<Resolution> {
  public readonly name = 'ResolutionValue';

  public readonly value: Resolution;

  constructor(resolution: Resolution | null, _args?: MetricFormatArgs) {
    this.value = {
      width: parseDimension(resolution?.width ?? null),
      height: parseDimension(resolution?.height ?? null),
    };
  }

  public get stringValue(): string {
    return this.toString();
  }

  public toString(): string {
    if (this.value.width === null || this.value.height === null) {
      return '–';
    }

    if (this.value.width <= 0 || this.value.height <= 0) {
      return '–';
    }

    return `${this.value.width}x${this.value.height}`;
  }
}

export function resolutionValue(
  resolution: Resolution | null,
  args?: MetricFormatArgs
): ResolutionValue {
  return new ResolutionValue(resolution, args);
}

export default ResolutionValue;

function parseDimension(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);

  return Number.isFinite(parsed) ? parsed : null;
}
