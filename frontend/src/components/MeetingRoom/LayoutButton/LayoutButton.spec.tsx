import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, Mock, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { SessionContextType } from '../../../Context/SessionProvider/session';
import LayoutButton from './LayoutButton';
import useSessionContext from '../../../hooks/useSessionContext';

vi.mock('../../../hooks/useSessionContext');
const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
const sessionContext = {
  setLayoutMode: vi.fn(),
} as unknown as SessionContextType;

describe('LayoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSessionContext.mockReturnValue(sessionContext);
  });
  it('should render the sidebar view icon if it is an active speaker layout', () => {
    sessionContext.layoutMode = 'active-speaker';
    const { rerender } = render(
      <LayoutButton isScreenSharePresent={false} isPinningPresent={false} />
    );
    rerender(<LayoutButton isScreenSharePresent={false} isPinningPresent={false} />);
    expect(screen.getByTestId('ViewSidebarIcon')).toBeInTheDocument();
  });

  it('should call the set layout mode function when triggered', async () => {
    sessionContext.layoutMode = 'active-speaker';
    const { rerender } = render(
      <LayoutButton isScreenSharePresent={false} isPinningPresent={false} />
    );
    rerender(<LayoutButton isScreenSharePresent={false} isPinningPresent={false} />);
    const button = await screen.findByRole('button');
    await userEvent.click(button);
    expect(sessionContext.setLayoutMode).toHaveBeenCalled();

    sessionContext.layoutMode = 'grid';
    rerender(<LayoutButton isScreenSharePresent={false} isPinningPresent={false} />);
    await userEvent.click(button);
    expect(sessionContext.setLayoutMode).toHaveBeenCalled();
  });

  it('should render the sidebar window icon if it is a grid layout', () => {
    sessionContext.layoutMode = 'grid';
    const { rerender } = render(
      <LayoutButton isScreenSharePresent={false} isPinningPresent={false} />
    );
    rerender(<LayoutButton isScreenSharePresent={false} isPinningPresent={false} />);
    expect(screen.getByTestId('WindowIcon')).toBeInTheDocument();
  });

  it('should render the tooltip title that mentions switching to grid layout', async () => {
    sessionContext.layoutMode = 'active-speaker';
    const { rerender } = render(
      <LayoutButton isScreenSharePresent={false} isPinningPresent={false} />
    );
    rerender(<LayoutButton isScreenSharePresent={false} isPinningPresent={false} />);
    const button = await screen.findByRole('button');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.textContent).toBe('Switch to Grid layout');
  });

  it('should render the tooltip title that mentions switching to active speaker layout', async () => {
    sessionContext.layoutMode = 'grid';
    const { rerender } = render(
      <LayoutButton isScreenSharePresent={false} isPinningPresent={false} />
    );
    rerender(<LayoutButton isScreenSharePresent={false} isPinningPresent={false} />);
    const button = await screen.findByRole('button');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.textContent).toBe('Switch to Active Speaker layout');
  });

  it('should render the tooltip title that mentions switching layouts is not allowed when screenshare is present if currently in the grid mode', async () => {
    sessionContext.layoutMode = 'grid';
    const { rerender } = render(<LayoutButton isScreenSharePresent isPinningPresent={false} />);
    rerender(<LayoutButton isScreenSharePresent isPinningPresent={false} />);
    const button = await screen.findByRole('button');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.textContent).toBe('Cannot switch layout while screen share is active');
  });

  it('should render the tooltip title that mentions switching layouts is not allowed when screenshare is present if currently in the active speaker mode', async () => {
    sessionContext.layoutMode = 'active-speaker';
    const { rerender } = render(<LayoutButton isScreenSharePresent isPinningPresent={false} />);
    rerender(<LayoutButton isScreenSharePresent isPinningPresent={false} />);
    const button = await screen.findByRole('button');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.textContent).toBe('Cannot switch layout while screen share is active');
  });

  it('should render the tooltip title that mentions switching layouts is not allowed when a pinned participant is present', async () => {
    render(<LayoutButton isScreenSharePresent={false} isPinningPresent />);
    const button = await screen.findByRole('button');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.textContent).toBe('Cannot switch layout while a participant is pinned');
  });
});
