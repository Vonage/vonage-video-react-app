import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, Mock, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import LayoutButton from './LayoutButton';
import useSessionContext from '../../../hooks/useSessionContext';

vi.mock('../../../hooks/useSessionContext');

describe('LayoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should render the sidebar view icon if it is an active speaker layout', () => {
    (useSessionContext as Mock).mockReturnValue({ layoutMode: 'active-speaker' });
    render(<LayoutButton isScreenSharePresent={false} isPinnedPresent={false} />);
    expect(screen.getByTestId('ViewSidebarIcon')).toBeInTheDocument();
  });

  it('should render the sidebar window icon if it is a grid layout', () => {
    (useSessionContext as Mock).mockReturnValue({ layoutMode: 'grid' });
    render(<LayoutButton isScreenSharePresent={false} isPinnedPresent={false} />);
    expect(screen.getByTestId('WindowIcon')).toBeInTheDocument();
  });

  it('should render the tooltip title that mentions switching to grid layout', async () => {
    (useSessionContext as Mock).mockReturnValue({ layoutMode: 'active-speaker' });
    render(<LayoutButton isScreenSharePresent={false} isPinnedPresent={false} />);
    const button = await screen.findByRole('button');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.textContent).toBe('Switch to Grid layout');
  });

  it('should render the tooltip title that mentions switching to active speaker layout', async () => {
    (useSessionContext as Mock).mockReturnValue({ layoutMode: 'grid' });
    render(<LayoutButton isScreenSharePresent={false} isPinnedPresent={false} />);
    const button = await screen.findByRole('button');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.textContent).toBe('Switch to Active Speaker layout');
  });

  it('should render the tooltip title that mentions switching layouts is not allowed when screenshare is present if currently in the grid mode', async () => {
    (useSessionContext as Mock).mockReturnValue({ layoutMode: 'grid' });
    render(<LayoutButton isScreenSharePresent isPinnedPresent={false} />);
    const button = await screen.findByRole('button');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.textContent).toBe('Cannot switch layout while screen share is active');
  });

  it('should render the tooltip title that mentions switching layouts is not allowed when screenshare is present if currently in the active speaker mode', async () => {
    (useSessionContext as Mock).mockReturnValue({ layoutMode: 'active-speaker' });
    render(<LayoutButton isScreenSharePresent isPinnedPresent={false} />);
    const button = await screen.findByRole('button');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.textContent).toBe('Cannot switch layout while screen share is active');
  });

  it('should render the tooltip title that mentions switching layouts is not allowed when a pinned participant is present', async () => {
    (useSessionContext as Mock).mockReturnValue({ layoutMode: 'grid' });
    render(<LayoutButton isScreenSharePresent={false} isPinnedPresent />);
    const button = await screen.findByRole('button');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.textContent).toBe('Cannot switch layout while a participant is pinned');
  });
});
