import { describe, it, expect, vi, beforeEach } from 'vitest';
import shouldOfferReloadRecovery from './shouldOfferReloadRecovery';
import { isWebKit } from '@web/platform';
import isFirefox from '@web/platform/isFirefox';

vi.mock('@web/platform', () => ({ isWebKit: vi.fn() }));
vi.mock('@web/platform/isFirefox', () => ({ default: vi.fn() }));

describe('shouldOfferReloadRecovery', () => {
  beforeEach(() => {
    vi.mocked(isWebKit).mockReturnValue(false);
    vi.mocked(isFirefox).mockReturnValue(false);
  });

  it('is true on Safari (WebKit)', () => {
    vi.mocked(isWebKit).mockReturnValue(true);
    expect(shouldOfferReloadRecovery()).toBe(true);
  });

  it('is true on Firefox', () => {
    vi.mocked(isFirefox).mockReturnValue(true);
    expect(shouldOfferReloadRecovery()).toBe(true);
  });

  it('is false on Chromium (neither WebKit nor Firefox)', () => {
    expect(shouldOfferReloadRecovery()).toBe(false);
  });
});
