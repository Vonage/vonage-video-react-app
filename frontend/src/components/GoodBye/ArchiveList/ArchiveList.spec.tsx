import { ReactElement, StrictMode } from 'react';
import { describe, expect, it } from 'vitest';
import { render as renderBase, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ArchiveList from './ArchiveList';
import { ProviderOptions, makeTestProvider, providers } from '@test/providers';
import { composeProviders } from '@web/helpers';
import { makeVideoClientMock } from '@core-test/fixtures';
import { makeArchive } from '@common-test/fixtures';

describe('ArchiveList', () => {
  it('should display an error state when recordings cannot be loaded', async () => {
    expect.assertions(1);

    const videoClient = makeVideoClientMock({
      searchArchives: Promise.reject(new Error('Failed to fetch archives')),
    });

    render(<ArchiveList queryOptions={{ retry: false }} />, {
      runtimeContext: { videoClient },
    });

    expect(
      await screen.findByText('There was an error loading recordings for this meeting')
    ).toBeVisible();
  });

  it('should display an empty state when there are no recordings', async () => {
    expect.assertions(1);

    const videoClient = makeVideoClientMock({
      searchArchives: Promise.resolve({
        count: 0,
        items: [],
      }),
    });

    render(<ArchiveList queryOptions={{ retry: false }} />, {
      runtimeContext: { videoClient },
    });

    expect(await screen.findByTestId('archive-list-empty')).toBeVisible();
  });

  it('should render the right user action for available, pending, and failed recordings', async () => {
    expect.assertions(3);

    const availableArchive = makeArchive('available');
    const pendingArchive = makeArchive('pending');
    const failedArchive = makeArchive('failed');

    const videoClient = makeVideoClientMock({
      searchArchives: Promise.resolve({
        count: 3,
        items: [availableArchive, pendingArchive, failedArchive],
      }),
    });

    render(<ArchiveList queryOptions={{ retry: false }} />, {
      runtimeContext: { videoClient },
    });

    const downloadLink = await screen.findByRole('link', {
      name: /download/i,
    });

    expect(downloadLink).toHaveAttribute('href', availableArchive.url);
    expect(await screen.findByTestId('archive-loading-spinner')).toBeVisible();
    expect(screen.getByTestId('archive-error-icon')).toBeVisible();
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
  runtimeContext?: ProviderOptions['RuntimeContext'];
};

function render(
  ui: ReactElement,
  { userContext, sessionContext, runtimeContext }: RenderOptions = {}
) {
  const { wrapper: ContextWrapper, ...context } = makeTestProvider(
    [providers.user, providers.session, providers.runtime],
    {
      userContext,
      sessionContext,
      runtimeContext,
    }
  );

  const wrapper = composeProviders(StrictMode, MemoryRouter, ContextWrapper);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
