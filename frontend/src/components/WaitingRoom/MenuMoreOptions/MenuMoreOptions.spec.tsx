import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import * as clientSdkVideo from '@vonage/client-sdk-video';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import composeProviders from '@web/helpers/composeProviders';
import MenuMoreOptions from './MenuMoreOptions';
import { env } from '../../../env';

describe('MenuMoreOptions', () => {
  const mockOnClose = vi.fn();
  const mockAnchorEl = document.createElement('button');

  beforeEach(() => {
    mockOnClose.mockClear();
    vi.spyOn(clientSdkVideo, 'hasMediaProcessorSupport').mockReturnValue(true);
  });

  it('should render when open is true', () => {
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    expect(screen.getByTestId('menu-more-options')).toBeInTheDocument();
  });

  it('should not render menu items when open is false', () => {
    render(<MenuMoreOptions onClose={mockOnClose} open={false} anchorEl={mockAnchorEl} />);

    expect(screen.queryByText(/video effects/i)).not.toBeInTheDocument();
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

    const videoEffectsMenuItem = screen.getByText(/video effects/i).closest('li');

    await user.hover(videoEffectsMenuItem!.parentElement as HTMLElement);

    expect(
      await screen.findByText(/your browser does not support this feature/i)
    ).toBeInTheDocument();
  });
});

function render(ui: ReactElement) {
  const wrapper = composeProviders(
    backgroundEffectsDialog$.Provider,
    precallNetworkTestDialog$.Provider
  );
  return renderBase(ui, { wrapper });
}
