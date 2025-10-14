/* eslint-disable import/first */
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../env', async () => {
  const actual = await vi.importActual<typeof import('../../env')>('../../env');
  const { Env } = actual;

  return {
    ...actual,
    default: new Env({}),
  };
});

import env from '../../env';
import isReportIssueEnabled from './isReportIssueEnabled';

describe('isReportIssueEnabled', () => {
  it('returns true when enabled', () => {
    env.VITE_ENABLE_REPORT_ISSUE = true;

    expect(isReportIssueEnabled()).toBe(true);
  });

  it('returns false when disabled', () => {
    env.VITE_ENABLE_REPORT_ISSUE = false;

    expect(isReportIssueEnabled()).toBe(false);
  });
});
