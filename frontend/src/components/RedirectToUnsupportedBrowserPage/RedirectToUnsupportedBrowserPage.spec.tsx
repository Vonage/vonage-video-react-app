import { describe, it, expect, vi, Mock } from 'vitest';
import { checkSystemRequirements } from '@vonage/client-sdk-video';
import { render } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import MemoryRouter from '@test/RouterWrapper';
import RedirectToUnsupportedBrowserPage from './RedirectToUnsupportedBrowserPage';

vi.mock('@vonage/client-sdk-video', () => ({ checkSystemRequirements: vi.fn() }));

describe('RedirectToUnsupportedBrowserPage', () => {
  const supportedText = 'You have arrived';
  const unsupportedText = 'Your browser is unsupported';
  const TestComponent = () => <div>{supportedText}</div>;

  it('for unsupported browsers, redirects to the unsupported browser page', () => {
    // Mocking an unsupported browser
    (checkSystemRequirements as Mock).mockReturnValue(0);

    const { getByText } = render(
      <MemoryRouter initialEntries={['/waiting-room/happy-hippo']}>
        <Routes>
          <Route path="/unsupported-browser" element={<div>{unsupportedText}</div>} />

          <Route element={<RedirectToUnsupportedBrowserPage />}>
            <Route path="/waiting-room/happy-hippo" element={<TestComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(getByText(unsupportedText)).toBeInTheDocument();
  });

  it('for supported browsers, navigates to your destination', () => {
    // Mocking a supported browser
    (checkSystemRequirements as Mock).mockReturnValue(1);

    const { getByText } = render(
      <MemoryRouter initialEntries={['/happy-path']}>
        <Routes>
          <Route path="/unsupported-browser" element={<div>{unsupportedText}</div>} />
          <Route element={<RedirectToUnsupportedBrowserPage />}>
            <Route path="/happy-path" element={<TestComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(getByText(supportedText)).toBeInTheDocument();
  });
});
