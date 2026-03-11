import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';
import PopupAlert from './PopupAlert';

vi.mock('../../../hooks/useIsSmallViewport');

const mockUseIsSmallViewport = useIsSmallViewport as Mock<[], boolean>;

describe('PopupAlert', () => {
  beforeEach(() => {
    mockUseIsSmallViewport.mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('renders the title and message', () => {
      render(<PopupAlert title="Test Title" message="Test message" severity="info" />);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it.each(['warning', 'error', 'info'] as const)('renders with "%s" severity', (severity) => {
      render(<PopupAlert title="Title" message="Message" severity={severity} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('does not render a close button when closable is false', () => {
      render(<PopupAlert title="Title" message="Message" severity="info" closable={false} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders a close button when closable is true', () => {
      render(<PopupAlert title="Title" message="Message" severity="info" closable />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
