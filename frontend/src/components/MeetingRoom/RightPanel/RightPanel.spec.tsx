import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render as renderBase, screen } from '@testing-library/react';
import { ReactElement } from 'react';
import { makeTestProvider, providers } from '@test/providers';
import RightPanel from './RightPanel';

vi.mock('../../../hooks/useCollectBrowserInformation', () => ({
  default: () => ({ browser: 'TestBrowser' }),
}));

describe('RightPanel', () => {
  it('loads Report Issue on first open and keeps its form state across tab switches', async () => {
    const { rerender } = render(<RightPanel handleClose={() => {}} activeTab="closed" />);

    expect(screen.queryByTestId('title-input')).not.toBeInTheDocument();

    rerender(<RightPanel handleClose={() => {}} activeTab="issues" />);
    const titleInput = (await screen.findByTestId('title-input')).querySelector('input')!;
    fireEvent.change(titleInput, { target: { value: 'Audio drops' } });

    rerender(<RightPanel handleClose={() => {}} activeTab="chat" />);
    expect(screen.queryByTestId('title-input')).not.toBeInTheDocument();

    rerender(<RightPanel handleClose={() => {}} activeTab="issues" />);
    expect(screen.getByTestId('title-input').querySelector('input')).toHaveValue('Audio drops');
  });
});

function render(ui: ReactElement) {
  const { wrapper, ...context } = makeTestProvider(
    [providers.user, providers.session, providers.runtime],
    { userContext: undefined, sessionContext: undefined, runtimeContext: undefined }
  );

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
