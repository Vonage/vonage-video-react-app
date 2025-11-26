import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Grow from './index';

describe('Grow', () => {
  it('renders correctly', () => {
    render(
      <Grow in>
        <div>Grow content</div>
      </Grow>
    );

    expect(screen.getByText('Grow content')).toBeInTheDocument();
  });

  it('shows content when in prop is true', async () => {
    render(
      <Grow in timeout={200}>
        <div data-testid="grow-content">Visible content</div>
      </Grow>
    );

    await waitFor(() => {
      expect(screen.getByTestId('grow-content')).toBeInTheDocument();
    });
  });

  it('renders with custom timeout', async () => {
    render(
      <Grow in timeout={500}>
        <div data-testid="slow-grow">Slow grow content</div>
      </Grow>
    );

    await waitFor(() => {
      expect(screen.getByTestId('slow-grow')).toBeInTheDocument();
    });
  });

  it('renders with different timeout object', async () => {
    render(
      <Grow in timeout={{ enter: 300, exit: 200 }}>
        <div data-testid="custom-timeout">Custom timeout content</div>
      </Grow>
    );

    await waitFor(() => {
      expect(screen.getByTestId('custom-timeout')).toBeInTheDocument();
    });
  });

  it('renders with unmountOnExit', () => {
    render(
      <Grow in={false} unmountOnExit>
        <div data-testid="unmount-content">Should be unmounted</div>
      </Grow>
    );

    expect(screen.queryByTestId('unmount-content')).not.toBeInTheDocument();
  });

  it('renders with mountOnEnter', async () => {
    render(
      <Grow in mountOnEnter timeout={100}>
        <div data-testid="mount-content">Mount on enter content</div>
      </Grow>
    );

    await waitFor(() => {
      expect(screen.getByTestId('mount-content')).toBeInTheDocument();
    });
  });

  it('handles easing prop', async () => {
    render(
      <Grow in timeout={200} easing={{ enter: 'ease-in', exit: 'ease-out' }}>
        <div data-testid="easing-content">Easing content</div>
      </Grow>
    );

    await waitFor(() => {
      expect(screen.getByTestId('easing-content')).toBeInTheDocument();
    });
  });
});
