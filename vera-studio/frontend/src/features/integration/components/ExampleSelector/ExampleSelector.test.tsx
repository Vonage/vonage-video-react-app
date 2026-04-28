// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ExampleSelector from './ExampleSelector';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../../../../hooks', () => ({
  useNavBarSelection: () => ({ selectedPath: '/integration/server/create-handler' }),
}));

vi.mock('../../../../components', () => ({
  Separator: () => <hr />,
}));

describe('ExampleSelector', () => {
  it('renders server examples and navigates on click', () => {
    render(<ExampleSelector />);

    fireEvent.click(screen.getByText('Express'));

    expect(screen.getByText('Create Handler')).toBeTruthy();
    expect(navigateMock).toHaveBeenCalledWith('/integration/server/express');
  });
});
