import { cleanup, render as renderBase, screen } from '@testing-library/react';
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

  it('should call the set layout mode function when triggered', async () => {
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
    const button = await screen.findByRole('button');
    await userEvent.click(button);
    expect(mockSetLayoutMode).toHaveBeenCalled();

    cleanup();

    // Test with grid layout
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
    const button2 = await screen.findByRole('button');
    await userEvent.click(button2);
    expect(mockSetLayoutMode).toHaveBeenCalledTimes(2);
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
    const button = await screen.findByRole('button');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.textContent).toBe('Switch to Grid layout');
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
    const button = await screen.findByRole('button');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.textContent).toBe('Switch to Active Speaker layout');
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
    const button = await screen.findByRole('button');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.textContent).toBe('Cannot switch layout while screen share is active');
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
    const button = await screen.findByRole('button');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.textContent).toBe('Cannot switch layout while screen share is active');
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
    const button = await screen.findByRole('button');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.textContent).toBe('Cannot switch layout while a participant is pinned');
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
};

function render(ui: ReactElement, { userContext, sessionContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider(
    [providers.user, providers.session, providers.runtime],
    {
      sessionContext,
      userContext,
      runtimeContext: undefined,
    }
  );

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
