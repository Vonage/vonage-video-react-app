import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BannerDateTime from './BannerDateTime';

describe('BannerDateTime', () => {
  it('renders the banner date and time', () => {
    const rawDate = new Date('June 27, 2024 21:12:00');
    vi.setSystemTime(rawDate);
    render(<BannerDateTime />);

    const bannerTime = screen.getByTestId('current-time');
    expect(bannerTime.textContent).toBe('9:12 PM');

    const bannerDate = screen.getByTestId('current-date');
    expect(bannerDate.textContent).toBe('Thu, Jun 27');
  });
});
