// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import CreateHandlerExample from './CreateHandlerExample';

const selectAuthTypeMock = vi.fn();

vi.mock('../../stores/integrationExamples$', () => ({
  default: {
    use: {
      select: () => 'jwt',
      actions: () => ({ selectAuthType: selectAuthTypeMock }),
    },
  },
}));

vi.mock('../../helpers/generateSnippets', () => ({
  generateHandlerConfigSnippet: () => "createVideoHandler({ auth: { authType: 'jwt' } })",
}));

vi.mock('../../../../components', () => ({
  Button: ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  CodeDisplay: ({ code }: { code: string }) => <pre>{code}</pre>,
  Separator: () => <hr />,
}));

describe('CreateHandlerExample', () => {
  it('changes auth type on button click', () => {
    render(<CreateHandlerExample />);

    fireEvent.click(screen.getByText('API Key'));

    expect(selectAuthTypeMock).toHaveBeenCalledWith('apiKey');
    expect(screen.getByText(/authType: 'jwt'/)).toBeTruthy();
  });
});
