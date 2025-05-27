import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import App from './App';

// Mock the page components to make text assertions easy
vi.mock('./pages/LandingPage', () => ({ default: () => <div>Landing Page</div> }));
vi.mock('./pages/GoodBye/index', () => ({ default: () => <div>GoodBye Page</div> }));
vi.mock('./pages/UnsupportedBrowserPage', () => ({
  default: () => <div>Unsupported Browser</div>,
}));

// Mock context providers and wrappers
vi.mock('./Context/PreviewPublisherProvider', () => ({
  __esModule: true,
  PreviewPublisherProvider: ({ children }: React.PropsWithChildren) => children,
  default: ({ children }: React.PropsWithChildren) => children,
}));
vi.mock('./Context/PublisherProvider', () => ({
  __esModule: true,
  PublisherProvider: ({ children }: React.PropsWithChildren) => children,
  default: ({ children }: React.PropsWithChildren) => children,
}));
vi.mock('./Context/SessionProvider/session', () => ({
  default: ({ children }: React.PropsWithChildren) => children,
}));
vi.mock('./components/RedirectToWaitingRoom', () => ({
  default: ({ children }: React.PropsWithChildren) => children,
}));
vi.mock('./Context/RoomContext', () => ({
  default: ({ children }: React.PropsWithChildren) => children,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('App routing', () => {
  it('renders LandingPage on unknown route', () => {
    window.history.pushState({}, '', '/unknown');
    render(<App />);
    screen.debug(); // For debugging purposes
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
