import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PushPinOffIcon from './index';

describe('PushPinOffIcon', () => {
  it('should display the correct PushPinOffIcon', async () => {
    render(<PushPinOffIcon sx={{ fontSize: '24px', color: 'white' }} />);

    expect(screen.queryByTestId('PushPinOffIcon')).toBeInTheDocument();
  });
});
