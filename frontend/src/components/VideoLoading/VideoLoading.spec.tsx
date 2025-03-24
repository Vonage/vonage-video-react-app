import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import VideoLoading from './VideoLoading';

describe('VideoLoading', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render the VideoLoading component', () => {
    render(<VideoLoading />);

    expect(screen.getByTestId('VideoLoading')).toBeInTheDocument();
  });

  it('should contain a CircularProgress component', () => {
    render(<VideoLoading />);

    expect(screen.getByTestId('CircularProgress')).toBeInTheDocument();
  });
});
