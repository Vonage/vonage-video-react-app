import { cleanup, render as renderBase, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import LayoutButton from './LayoutButton';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';

describe('LayoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });
  it('should render the sidebar view icon if it is an active speaker layout', () => {
    const mockSetLayoutMode = vi.fn();
    render(<LayoutButton isScreenSharePresent={false} isPinningPresent={false} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.layoutMode = 'active-speaker';
            context.setLayoutMode = mockSetLayoutMode;
          }
        },
      },
    });
    expect(screen.getByTestId('ViewSidebarIcon')).toBeInTheDocument();
  });

  it('clicking the button toggles layout mode', async () => {
    const mockSetLayoutMode = vi.fn();
    render(<LayoutButton isScreenSharePresent={false} isPinningPresent={false} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.layoutMode = 'active-speaker';
            context.setLayoutMode = mockSetLayoutMode;
          }
        },
      },
    });
    const button = await screen.findByTestId('layout-button');
    await userEvent.click(button);
    expect(mockSetLayoutMode).toHaveBeenCalledTimes(1);
    const firstArg = mockSetLayoutMode.mock.calls[0]?.[0] as (prev: string) => string;
    expect(typeof firstArg).toBe('function');
    expect(firstArg('active-speaker')).toBe('grid');

    cleanup();

    // Toggle from grid to active-speaker
    mockSetLayoutMode.mockClear();
    render(<LayoutButton isScreenSharePresent={false} isPinningPresent={false} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.layoutMode = 'grid';
            context.setLayoutMode = mockSetLayoutMode;
          }
        },
      },
    });
    const button2 = await screen.findByTestId('layout-button');
    await userEvent.click(button2);
    expect(mockSetLayoutMode).toHaveBeenCalledTimes(1);
    const secondArg = mockSetLayoutMode.mock.calls[0]?.[0] as (prev: string) => string;
    expect(typeof secondArg).toBe('function');
    expect(secondArg('grid')).toBe('active-speaker');
  });

  it('opens the layout menu via chevron and allows choosing layout', async () => {
    const mockSetLayoutMode = vi.fn();
    render(<LayoutButton isScreenSharePresent={false} isPinningPresent={false} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.layoutMode = 'grid';
            context.setLayoutMode = mockSetLayoutMode;
          }
        },
      },
    });
    const chevron = await screen.findByTestId('layout-menu-trigger');
    await userEvent.click(chevron);
    await screen.findByText('Adjust view');
    const speakerOption = await screen.findByTestId('layout-option-active-speaker');
    await userEvent.click(speakerOption);
    expect(mockSetLayoutMode).toHaveBeenCalledWith('active-speaker');

    // re-open via chevron to ensure toggling open/close works
    await userEvent.click(chevron);
    await waitFor(() => expect(screen.getByText('Adjust view')).toBeInTheDocument());
  });

  it('should render the sidebar window icon if it is a grid layout', () => {
    const mockSetLayoutMode = vi.fn();
    render(<LayoutButton isScreenSharePresent={false} isPinningPresent={false} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.layoutMode = 'grid';
            context.setLayoutMode = mockSetLayoutMode;
          }
        },
      },
    });
    expect(screen.getByTestId('ViewSidebarIcon')).toBeInTheDocument();
  });

  it('should render the tooltip title that mentions switching to grid layout', async () => {
    const mockSetLayoutMode = vi.fn();
    render(<LayoutButton isScreenSharePresent={false} isPinningPresent={false} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.layoutMode = 'active-speaker';
            context.setLayoutMode = mockSetLayoutMode;
          }
        },
      },
    });
    const button = await screen.findByTestId('layout-button');
    await userEvent.hover(button);
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip.textContent).toBe('Switch to Grid layout');
    });
  });

  it('should render the tooltip title that mentions switching to active speaker layout', async () => {
    const mockSetLayoutMode = vi.fn();
    render(<LayoutButton isScreenSharePresent={false} isPinningPresent={false} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.layoutMode = 'grid';
            context.setLayoutMode = mockSetLayoutMode;
          }
        },
      },
    });
    const button = await screen.findByTestId('layout-button');
    await userEvent.hover(button);
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip.textContent).toBe('Switch to Active Speaker layout');
    });
  });

  it('should render the tooltip title that mentions switching layouts is not allowed when screenshare is present if currently in the grid mode', async () => {
    const mockSetLayoutMode = vi.fn();
    render(<LayoutButton isScreenSharePresent isPinningPresent={false} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.layoutMode = 'grid';
            context.setLayoutMode = mockSetLayoutMode;
          }
        },
      },
    });
    const button = await screen.findByTestId('layout-button');
    await userEvent.hover(button);
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip.textContent).toBe('Cannot switch layout while screen share is active');
    });
  });

  it('should render the tooltip title that mentions switching layouts is not allowed when screenshare is present if currently in the active speaker mode', async () => {
    const mockSetLayoutMode = vi.fn();
    render(<LayoutButton isScreenSharePresent isPinningPresent={false} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.layoutMode = 'active-speaker';
            context.setLayoutMode = mockSetLayoutMode;
          }
        },
      },
    });
    const button = await screen.findByTestId('layout-button');
    await userEvent.hover(button);
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip.textContent).toBe('Cannot switch layout while screen share is active');
    });
  });

  it('should render the tooltip title that mentions switching layouts is not allowed when a pinned participant is present', async () => {
    const mockSetLayoutMode = vi.fn();
    render(<LayoutButton isScreenSharePresent={false} isPinningPresent />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.setLayoutMode = mockSetLayoutMode;
          }
        },
      },
    });
    const button = await screen.findByTestId('layout-button');
    await userEvent.hover(button);
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip.textContent).toBe('Cannot switch layout while a participant is pinned');
    });
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
};

function render(ui: ReactElement, { userContext, sessionContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.user, providers.session], {
    userContext,
    sessionContext,
  });

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
