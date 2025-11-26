import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Portal from './index';

describe('Portal', () => {
  it('renders correctly', () => {
    render(
      <Portal>
        <div data-testid="portal-content">Portal content</div>
      </Portal>
    );

    expect(screen.getByTestId('portal-content')).toBeInTheDocument();
    expect(screen.getByText('Portal content')).toBeInTheDocument();
  });

  it('renders content in document body by default', () => {
    render(
      <Portal>
        <div data-testid="body-portal">Body portal content</div>
      </Portal>
    );

    const portalContent = screen.getByTestId('body-portal');
    expect(portalContent).toBeInTheDocument();

    expect(document.body.contains(portalContent)).toBe(true);
  });

  it('renders content in custom container', () => {
    const customContainer = document.createElement('div');
    customContainer.setAttribute('data-testid', 'custom-container');
    document.body.appendChild(customContainer);

    render(
      <Portal container={customContainer}>
        <div data-testid="custom-portal">Custom container content</div>
      </Portal>
    );

    const portalContent = screen.getByTestId('custom-portal');
    expect(portalContent).toBeInTheDocument();

    expect(customContainer.contains(portalContent)).toBe(true);

    document.body.removeChild(customContainer);
  });

  it('can be disabled', () => {
    render(
      <div data-testid="parent-container">
        <Portal disablePortal>
          <div data-testid="disabled-portal">Disabled portal content</div>
        </Portal>
      </div>
    );

    const portalContent = screen.getByTestId('disabled-portal');
    const parentContainer = screen.getByTestId('parent-container');

    expect(portalContent).toBeInTheDocument();
    expect(parentContainer.contains(portalContent)).toBe(true);
  });

  it('handles multiple children', () => {
    render(
      <Portal>
        <div data-testid="portal-child1">Child 1</div>
        <div data-testid="portal-child2">Child 2</div>
      </Portal>
    );

    expect(screen.getByTestId('portal-child1')).toBeInTheDocument();
    expect(screen.getByTestId('portal-child2')).toBeInTheDocument();
  });

  it('handles container function', () => {
    const getContainer = () => {
      const container = document.createElement('div');
      container.setAttribute('data-testid', 'function-container');
      document.body.appendChild(container);
      return container;
    };

    render(
      <Portal container={getContainer}>
        <div data-testid="function-portal">Function container content</div>
      </Portal>
    );

    const portalContent = screen.getByTestId('function-portal');
    expect(portalContent).toBeInTheDocument();

    const functionContainer = document.querySelector('[data-testid="function-container"]');
    if (functionContainer) {
      document.body.removeChild(functionContainer);
    }
  });
});
