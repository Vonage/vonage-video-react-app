import { describe, it, expect } from 'vitest';
import formatFileSize from './formatFileSize';

describe('formatFileSize', () => {
  it('should format bytes', () => {
    expect(formatFileSize(0)).toBe('--');
    expect(formatFileSize(1)).toBe('1 B');
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1023)).toBe('1023 B');
  });

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(102400)).toBe('100.0 KB');
  });

  it('should format megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1.0 MB');
    expect(formatFileSize(2097152)).toBe('2.0 MB');
    expect(formatFileSize(5242880)).toBe('5.0 MB');
    expect(formatFileSize(1572864)).toBe('1.5 MB');
  });

  it('should format gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1.0 GB');
    expect(formatFileSize(2147483648)).toBe('2.0 GB');
    expect(formatFileSize(5368709120)).toBe('5.0 GB');
  });

  it('should format terabytes', () => {
    expect(formatFileSize(1099511627776)).toBe('1.0 TB');
    expect(formatFileSize(2199023255552)).toBe('2.0 TB');
  });

  it('should handle undefined', () => {
    expect(formatFileSize(undefined)).toBe('--');
  });

  it('should handle negative values', () => {
    expect(formatFileSize(-100)).toBe('--');
  });

  it('should round to one decimal place for non-byte units', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(1638)).toBe('1.6 KB');
    expect(formatFileSize(1741)).toBe('1.7 KB');
  });

  it('should not show decimals for bytes', () => {
    expect(formatFileSize(999)).toBe('999 B');
    expect(formatFileSize(1)).toBe('1 B');
  });
});
