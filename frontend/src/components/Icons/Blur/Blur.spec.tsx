import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Blur from './index';

describe('Blur', () => {
  it('should display the correct Blur', async () => {
    render(<Blur sx={{ fontSize: '24px', color: 'white' }} />);

    // Check icon is correctly displayed
    expect(screen.queryByTestId('blurIcon')).toBeInTheDocument();
  });
});
