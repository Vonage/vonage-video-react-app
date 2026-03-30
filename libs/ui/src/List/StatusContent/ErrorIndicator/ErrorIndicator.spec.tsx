import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ErrorIndicator from './ErrorIndicator';

describe('ErrorIndicator', () => {
  it('renders the error icon', () => {
    render(<ErrorIndicator errorTooltip="This recording failed or has expired" />);

    expect(screen.getByTestId('list-error-icon')).toBeVisible();
  });
});
