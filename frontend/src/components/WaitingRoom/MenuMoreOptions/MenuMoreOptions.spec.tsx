import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import * as clientSdkVideo from '@vonage/client-sdk-video';
import advancedSettings$ from '@Context/AdvancedSettings';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import composeProviders from '@web/helpers/composeProviders';
import MenuMoreOptions from './MenuMoreOptions';
import { env } from '../../../env';

describe('MenuMoreOptions', () => {
  const mockOnClose = vi.fn();
  const mockAnchorEl = document.createElement('button');

  beforeEach(() => {
    env.reset();
    mockOnClose.mockReset();
    vi.spyOn(clientSdkVideo, 'hasMediaProcessorSupport').mockReturnValue(true);
  });

  afterEach(() => {
    env.reset();
  });

  it('should render when open is true', () => {
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    expect(screen.getByTestId('menu-more-options')).toBeInTheDocument();
  });

  it('should keep menu items as direct children of the menu list', () => {
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    const menuListElement = screen.getByRole('menu');

    expect(Array.from(menuListElement.children).every((child) => child.tagName === 'LI')).toBe(
      true
    );
  });

  it('should not render menu items when open is false', () => {
    render(<MenuMoreOptions onClose={mockOnClose} open={false} anchorEl={mockAnchorEl} />);

    expect(screen.queryByText(/^settings$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/video effects/i)).not.toBeInTheDocument();
  });

  it('should not display advanced settings option when the flag is disabled', () => {
    env.partialUpdate({ WAITING_ROOM_ALLOW_ADVANCED_SETTINGS: false });
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    expect(screen.queryByText(/^settings$/i)).not.toBeInTheDocument();
  });

  it('should display advanced settings option when the flag is enabled', () => {
    env.partialUpdate({ WAITING_ROOM_ALLOW_ADVANCED_SETTINGS: true });
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    expect(screen.getByText(/^settings$/i)).toBeInTheDocument();
  });

  it('should open advanced settings and close the menu when clicking the option', async () => {
    const user = userEvent.setup();

    env.partialUpdate({ WAITING_ROOM_ALLOW_ADVANCED_SETTINGS: true });
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    const advancedSettingsMenuItem = screen.getByText(/^settings$/i);

    await user.click(advancedSettingsMenuItem);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(advancedSettings$.getState().isOpen).toBe(true);
  });

  it('should display video effects option when media processor is supported', () => {
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    expect(screen.getByText(/video effects/i)).toBeInTheDocument();
  });

  it('should call onClose when clicking on video effects option', async () => {
    const user = userEvent.setup();
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    const menuItem = screen.getByText(/video effects/i);
    await user.click(menuItem);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display icon for video effects', () => {
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    expect(screen.getByTestId('vivid-icon-gallery-line')).toBeInTheDocument();
  });

  it('should not display video effects option when media processor is not supported', () => {
    vi.spyOn(clientSdkVideo, 'hasMediaProcessorSupport').mockReturnValue(false);
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    expect(screen.getByText(/video effects/i).closest('li')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('should not display video effects option when background effects are not allowed', () => {
    env.partialUpdate({ ALLOW_BACKGROUND_EFFECTS: false });
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    expect(screen.getByText(/video effects/i).closest('li')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('should still display precall network test when media processor is not supported', () => {
    vi.spyOn(clientSdkVideo, 'hasMediaProcessorSupport').mockReturnValue(false);
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    expect(screen.getByText(/pre-call network test/i)).toBeInTheDocument();
    expect(screen.getByText(/pre-call network test/i).closest('li')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('shows an unsupported-feature tooltip for disabled menu items', async () => {
    const user = userEvent.setup();

    vi.spyOn(clientSdkVideo, 'hasMediaProcessorSupport').mockReturnValue(false);
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    const videoEffectsMenuItem = screen.getByRole('menuitem', { name: /video effects/i });

    await user.hover(videoEffectsMenuItem);

    expect(
      await screen.findByText(/your browser does not support this feature/i)
    ).toBeInTheDocument();
  });

  it('does not show the unsupported-feature tooltip when the menu first opens', () => {
    vi.spyOn(clientSdkVideo, 'hasMediaProcessorSupport').mockReturnValue(false);
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    expect(
      screen.queryByText(/your browser does not support this feature/i)
    ).not.toBeInTheDocument();
  });
});

function render(ui: ReactElement) {
  const wrapper = composeProviders(
    backgroundEffectsDialog$.Provider,
    precallNetworkTestDialog$.Provider
  );
  return renderBase(ui, { wrapper });
}
