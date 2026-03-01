import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render as renderBase, screen } from '@testing-library/react';
import { ReactElement, RefObject } from 'react';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import ContentHintMenu, { ContentHintMenuProps } from './ContentHintMenu';

describe('ContentHintMenu', () => {
  const mockAnchorRef = {
    current: document.createElement('button'),
  } as RefObject<HTMLButtonElement>;

  const defaultProps: ContentHintMenuProps = {
    anchorRef: mockAnchorRef,
    isOpen: true,
    isSharingScreen: false,
    selectedHint: 'detail',
    currentContentHint: 'detail',
    onHintChange: vi.fn(),
    onShare: vi.fn(),
    onApply: vi.fn(),
    onCancel: vi.fn(),
    onMenuMouseEnter: vi.fn(),
    onMenuMouseLeave: vi.fn(),
    handleClose: vi.fn(),
  };

  it('renders the "Share" primary action button when not sharing', () => {
    render(<ContentHintMenu {...defaultProps} />);
    expect(screen.getByTestId('content-hint-primary-button')).toHaveTextContent('Share');
  });

  it('renders the "Apply" primary action button when sharing and the hint has changed', () => {
    render(
      <ContentHintMenu
        {...defaultProps}
        isSharingScreen
        selectedHint="motion"
        currentContentHint="detail"
      />
    );
    expect(screen.getByTestId('content-hint-primary-button')).toHaveTextContent('Apply');
  });

  it('hides the primary action button when sharing and the hint has not changed', () => {
    render(
      <ContentHintMenu
        {...defaultProps}
        isSharingScreen
        selectedHint="detail"
        currentContentHint="detail"
      />
    );
    expect(screen.queryByTestId('content-hint-primary-button')).not.toBeInTheDocument();
  });

  it('still shows the Cancel button when sharing and the hint has not changed', () => {
    render(
      <ContentHintMenu
        {...defaultProps}
        isSharingScreen
        selectedHint="detail"
        currentContentHint="detail"
      />
    );
    expect(screen.getByTestId('content-hint-cancel-button')).toBeInTheDocument();
  });

  it('calls onShare when the primary button is clicked and not sharing', () => {
    const onShare = vi.fn();
    render(<ContentHintMenu {...defaultProps} onShare={onShare} />);
    fireEvent.click(screen.getByTestId('content-hint-primary-button'));
    expect(onShare).toHaveBeenCalledOnce();
  });

  it('calls onApply when the primary button is clicked and sharing with a changed hint', () => {
    const onApply = vi.fn();
    render(
      <ContentHintMenu
        {...defaultProps}
        isSharingScreen
        selectedHint="motion"
        currentContentHint="detail"
        onApply={onApply}
      />
    );
    fireEvent.click(screen.getByTestId('content-hint-primary-button'));
    expect(onApply).toHaveBeenCalledOnce();
  });

  it('calls onCancel when the Cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<ContentHintMenu {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByTestId('content-hint-cancel-button'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('renders the content hint select dropdown', () => {
    render(<ContentHintMenu {...defaultProps} />);
    expect(screen.getByTestId('content-hint-select')).toBeInTheDocument();
  });

  it('is not rendered when isOpen is false', () => {
    render(<ContentHintMenu {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('content-hint-primary-button')).not.toBeInTheDocument();
  });
});

type RenderOptions = {
  appConfigContext?: ProviderOptions['AppConfigContext'];
};

function render(ui: ReactElement, { appConfigContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.appConfig], {
    appConfigContext,
  });

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
