import { afterAll, describe, expect, it, vi } from 'vitest';
import isReportIssueEnabled from './isReportIssueEnabled';

describe('constants', () => {
  describe('IS_REPORT_ISSUE_ENABLED', () => {
    afterAll(() => {
      vi.unstubAllEnvs();
    });

    it('returns true when configured to be enabled', () => {
      vi.stubEnv('VITE_ENABLE_REPORT_ISSUE', 'true');

      expect(isReportIssueEnabled()).toBe(true);
    });

    it('returns false when configured to be disabled', () => {
      vi.stubEnv('VITE_ENABLE_REPORT_ISSUE', 'false');

      expect(isReportIssueEnabled()).toBe(false);
    });

    it('returns false when not configured', () => {
      // @ts-expect-error Undefined is allowed, see https://vitest.dev/api/vi#vi-stubenv
      vi.stubEnv('VITE_ENABLE_REPORT_ISSUE', undefined);

      expect(isReportIssueEnabled()).toBe(false);
    });
  });
});
