import { render as renderBase, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React, { PropsWithChildren } from 'react';
import { makeAppConfigProviderWrapper } from '@test/providers';
import { App } from './App';

// Mock the page components to make text assertions easy
vi.mock('./pages/LandingPage', () => ({ default: () => <div>Landing Page</div> }));
vi.mock('./pages/GoodBye/index', () => ({ default: () => <div>GoodBye Page</div> }));
vi.mock('./pages/UnsupportedBrowserPage', () => ({
  default: () => <div>Unsupported Browser</div>,
}));

vi.mock('./components/RedirectToWaitingRoom', () => ({
  default: ({ children }: PropsWithChildren) => children,
}));

describe('App routing', () => {
  it('renders LandingPage on unknown route', () => {
    window.history.pushState({}, '', '/unknown');
    render(<App />);
    expect(screen.getByText(/Landing Page/i)).toBeInTheDocument();
  });

  it('renders GoodBye page on /goodbye', () => {
    window.history.pushState({}, '', '/goodbye');
    render(<App />);
    expect(screen.getByText(/GoodBye Page/i)).toBeInTheDocument();
  });

  it('renders UnsupportedBrowserPage on /unsupported-browser', () => {
    window.history.pushState({}, '', '/unsupported-browser');
    render(<App />);
    expect(screen.getByText(/Unsupported Browser/i)).toBeInTheDocument();
  });
});

function render(ui: React.ReactElement) {
  const { AppConfigWrapper } = makeAppConfigProviderWrapper();

  return renderBase(ui, {
    wrapper: AppConfigWrapper,
  });
}
