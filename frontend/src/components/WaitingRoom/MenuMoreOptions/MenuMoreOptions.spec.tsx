import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import { AppConfigProviderWrapperOptions, makeAppConfigProviderWrapper } from '@test/providers';
import MenuMoreOptions from './MenuMoreOptions';

const { mockHasMediaProcessorSupport } = vi.hoisted(() => {
  return {
    mockHasMediaProcessorSupport: vi.fn().mockReturnValue(true),
  };
});

vi.mock('@vonage/client-sdk-video', () => ({
  hasMediaProcessorSupport: mockHasMediaProcessorSupport,
}));

describe('MenuMoreOptions', () => {
  const mockOnClose = vi.fn();
  const mockAnchorEl = document.createElement('button');

  beforeEach(() => {
    mockOnClose.mockClear();
    mockHasMediaProcessorSupport.mockReturnValue(true);
  });

  it('should render when open is true', () => {
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />, {
      appConfigOptions: {
        value: {
          videoSettings: {
            allowBackgroundEffects: true,
          },
        },
      },
    });

    expect(screen.getByTestId('menu-more-options')).toBeInTheDocument();
  });

  it('should not render menu items when open is false', () => {
    render(<MenuMoreOptions onClose={mockOnClose} open={false} anchorEl={mockAnchorEl} />, {
      appConfigOptions: {
        value: {
          videoSettings: {
            allowBackgroundEffects: true,
          },
        },
      },
    });

    expect(screen.queryByText(/background effects/i)).not.toBeInTheDocument();
  });

  it('should display background effects option', () => {
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />, {
      appConfigOptions: {
        value: {
          videoSettings: {
            allowBackgroundEffects: true,
          },
        },
      },
    });

    expect(screen.getByText(/background effects/i)).toBeInTheDocument();
  });

  it('should call onClose when clicking on background effects option', async () => {
    const user = userEvent.setup();
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />, {
      appConfigOptions: {
        value: {
          videoSettings: {
            allowBackgroundEffects: true,
          },
        },
      },
    });

    const menuItem = screen.getByText(/background effects/i);
    await user.click(menuItem);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display icon for background effects', () => {
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />, {
      appConfigOptions: {
        value: {
          videoSettings: {
            allowBackgroundEffects: true,
          },
        },
      },
    });

    expect(screen.getByTestId('vivid-icon-gallery-line')).toBeInTheDocument();
  });
});

function render(
  ui: ReactElement,
  options?: {
    appConfigOptions?: AppConfigProviderWrapperOptions;
  }
) {
  const { AppConfigWrapper } = makeAppConfigProviderWrapper(options?.appConfigOptions);

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppConfigWrapper>
      <backgroundEffectsDialog$.Provider>{children}</backgroundEffectsDialog$.Provider>
    </AppConfigWrapper>
  );

  return renderBase(ui, { ...options, wrapper: Wrapper });
}
