import { describe, expect, it } from 'vitest';

import { env } from '../../env';
import isReportIssueEnabled from './isReportIssueEnabled';

describe('isReportIssueEnabled', () => {
  it('returns true when enabled', () => {
    env.ENABLE_REPORT_ISSUE = true;

    expect(isReportIssueEnabled()).toBe(true);
  });

  it('returns false when disabled', () => {
    env.ENABLE_REPORT_ISSUE = false;

    expect(isReportIssueEnabled()).toBe(false);
  });
});
