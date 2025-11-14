import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Fade from './index';

describe('Fade', () => {
  it('renders correctly', () => {
    render(
      <Fade in>
        <div>Fade content</div>
      </Fade>
    );

    expect(screen.getByText('Fade content')).toBeInTheDocument();
  });

  it('shows content when in prop is true', async () => {
    render(
      <Fade in timeout={200}>
        <div data-testid="fade-content">Visible content</div>
      </Fade>
    );

    await waitFor(() => {
      expect(screen.getByTestId('fade-content')).toBeInTheDocument();
    });
  });

  it('renders with custom timeout', async () => {
    render(
      <Fade in timeout={500}>
        <div data-testid="slow-fade">Slow fade content</div>
      </Fade>
    );

    await waitFor(() => {
      expect(screen.getByTestId('slow-fade')).toBeInTheDocument();
    });
  });

  it('renders with different timeout object', async () => {
    render(
      <Fade in timeout={{ enter: 300, exit: 200 }}>
        <div data-testid="custom-timeout">Custom timeout content</div>
      </Fade>
    );

    await waitFor(() => {
      expect(screen.getByTestId('custom-timeout')).toBeInTheDocument();
    });
  });

  it('renders with unmountOnExit', () => {
    render(
      <Fade in={false} unmountOnExit>
        <div data-testid="unmount-content">Should be unmounted</div>
      </Fade>
    );

    expect(screen.queryByTestId('unmount-content')).not.toBeInTheDocument();
  });

  it('renders with mountOnEnter', async () => {
    render(
      <Fade in mountOnEnter timeout={100}>
        <div data-testid="mount-content">Mount on enter content</div>
      </Fade>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mount-content')).toBeInTheDocument();
    });
  });

  it('handles easing prop', async () => {
    render(
      <Fade in timeout={200} easing={{ enter: 'ease-in', exit: 'ease-out' }}>
        <div data-testid="easing-content">Easing content</div>
      </Fade>
    );

    await waitFor(() => {
      expect(screen.getByTestId('easing-content')).toBeInTheDocument();
    });
  });

  it('handles appear prop for initial mount', async () => {
    render(
      <Fade in appear timeout={200}>
        <div data-testid="appear-content">Appear content</div>
      </Fade>
    );

    await waitFor(() => {
      expect(screen.getByTestId('appear-content')).toBeInTheDocument();
    });
  });
});
