import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LandingPage from './index';

vi.mock('../../components/Banner', () => ({
  default: () => <div data-testid="banner" />,
}));
vi.mock('../../components/LandingPageWelcome', () => ({
  default: () => <div data-testid="welcome" />,
}));
vi.mock('../../components/RoomJoinContainer', () => ({
  default: () => <div data-testid="room-join" />,
}));

describe('LandingPage', () => {
  it('renders Banner component', () => {
    render(<LandingPage />);
    expect(screen.getByTestId('banner')).toBeInTheDocument();
  });

  it('renders LandingPageWelcome component', () => {
    render(<LandingPage />);
    expect(screen.getByTestId('welcome')).toBeInTheDocument();
  });

  it('renders RoomJoinContainer component', () => {
    render(<LandingPage />);
    expect(screen.getByTestId('room-join')).toBeInTheDocument();
  });
});
