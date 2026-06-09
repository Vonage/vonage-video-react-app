import { describe, expect, it } from 'vitest';
import {
  formatBitrate,
  formatBytes,
  formatDuration,
  formatFrameRate,
  formatOptionalInteger,
  formatPacketLoss,
  formatResolution,
} from './formatters';

describe('statistics formatters', () => {
  describe('formatOptionalInteger', () => {
    it('returns a dash when value is null', () => {
      expect(formatOptionalInteger(null)).toBe('–');
    });
  });

  describe('formatBytes', () => {
    it('formats byte and unit thresholds', () => {
      expect(formatBytes(1023)).toBe('1023 B');
      expect(formatBytes(1024)).toBe('1.0 KB');
      expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0 GB');
    });
  });

  describe('formatResolution', () => {
    it('returns a dash for null or incomplete resolution', () => {
      expect(formatResolution(null)).toBe('–');
      expect(formatResolution({ width: null, height: 720 })).toBe('–');
      expect(formatResolution({ width: 1280, height: null })).toBe('–');
    });

    it('formats valid resolution', () => {
      expect(formatResolution({ width: 1280, height: 720 })).toBe('1280x720');
    });
  });

  describe('formatFrameRate', () => {
    it('returns a dash for null frame rate', () => {
      expect(formatFrameRate(null)).toBe('–');
    });

    it('rounds frame rate and appends fps', () => {
      expect(formatFrameRate(24.4)).toBe('24 fps');
    });
  });

  describe('formatBitrate', () => {
    it('returns a dash for null, zero, and negative bitrate', () => {
      expect(formatBitrate(null)).toBe('–');
      expect(formatBitrate(0)).toBe('–');
      expect(formatBitrate(-1)).toBe('–');
    });

    it('formats bitrate thresholds', () => {
      expect(formatBitrate(999)).toBe('999 bps');
      expect(formatBitrate(1000)).toBe('1.0 kbps');
      expect(formatBitrate(1_000_000)).toBe('1.00 Mbps');
    });
  });

  describe('formatPacketLoss', () => {
    it('returns a dash for null packet loss ratio', () => {
      expect(formatPacketLoss(null)).toBe('–');
    });

    it('formats packet loss ratio as percentage', () => {
      expect(formatPacketLoss(0.1234)).toBe('12.34%');
    });
  });

  describe('formatDuration', () => {
    it('returns a dash for null duration', () => {
      expect(formatDuration(null)).toBe('–');
    });

    it('formats millisecond and second thresholds', () => {
      expect(formatDuration(999)).toBe('999 ms');
      expect(formatDuration(1000)).toBe('1.0 s');
    });
  });
});
