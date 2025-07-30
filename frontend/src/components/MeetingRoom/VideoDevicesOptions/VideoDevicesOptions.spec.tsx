import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import VideoDevicesOptions from './VideoDevicesOptions';

describe('VideoDevicesOptions', () => {
  const toggleBackgroundEffects = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the background effects menu item', () => {
    render(<VideoDevicesOptions toggleBackgroundEffects={toggleBackgroundEffects} />);
    expect(screen.getByTestId('background-effects-text')).toHaveTextContent('Background effects');
    expect(screen.getByRole('menuitem')).toBeInTheDocument();
  });

  it('calls toggleBackgroundEffects when menu item is clicked', () => {
    render(<VideoDevicesOptions toggleBackgroundEffects={toggleBackgroundEffects} />);
    fireEvent.click(screen.getByRole('menuitem'));
    expect(toggleBackgroundEffects).toHaveBeenCalled();
  });
});
