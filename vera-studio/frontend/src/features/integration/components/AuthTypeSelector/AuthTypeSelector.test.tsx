// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import AuthTypeSelector from './AuthTypeSelector';

const selectAuthTypeMock = vi.fn();

vi.mock('../../stores/integrationExamples$', () => ({
  default: {
    use: {
      actions: () => ({ selectAuthType: selectAuthTypeMock }),
      select: () => 'jwt',
    },
  },
}));

vi.mock('../../../../components', () => ({
  Button: ({
    children,
    onClick,
    variant,
  }: {
    children: ReactNode;
    onClick: () => void;
    variant: string;
  }) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
}));

describe('AuthTypeSelector', () => {
  it('calls selectAuthType when an option is clicked', () => {
    render(<AuthTypeSelector />);

    fireEvent.click(screen.getByText('API Key Authentication'));

    expect(selectAuthTypeMock).toHaveBeenCalledWith('apiKey');
  });
});
