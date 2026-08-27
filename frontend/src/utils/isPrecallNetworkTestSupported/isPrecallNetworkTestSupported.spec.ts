import { describe, it, expect, vi, beforeEach } from 'vitest';
import isFirefox from '@web/platform/isFirefox';
import isPrecallNetworkTestSupported from './isPrecallNetworkTestSupported';

vi.mock('@web/platform/isFirefox', () => ({
  default: vi.fn(),
}));

describe('isPrecallNetworkTestSupported', () => {
  beforeEach(() => {
    vi.mocked(isFirefox).mockReset();
  });

  it('returns false on Firefox', () => {
    vi.mocked(isFirefox).mockReturnValue(true);

    expect(isPrecallNetworkTestSupported()).toBe(false);
  });

  it('returns true on non-Firefox browsers', () => {
    vi.mocked(isFirefox).mockReturnValue(false);

    expect(isPrecallNetworkTestSupported()).toBe(true);
  });
});
