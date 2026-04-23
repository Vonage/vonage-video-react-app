import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import PreviewAvatar from './PreviewAvatar';

const TestComponent = ({ children }: { children: ReactNode }) => {
  return <div data-testid="TestComponent">{children}</div>;
};

describe('PreviewAvatar', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render initials when provided', () => {
    render(
      <PreviewAvatar
        initials="AZ"
        username="Apple Zebra"
        isVideoEnabled={false}
        isVideoLoading={false}
      />
    );

    expect(screen.getByText(/AZ/)).toBeVisible();
  });

  it('should render avatar when no initials are provided', () => {
    const { container } = render(
      <PreviewAvatar initials="" username="" isVideoEnabled={false} isVideoLoading={false} />
    );

    const avatar = container.querySelector('[data-testid="PersonIcon"]');
    expect(avatar).toBeVisible();
  });

  describe('should not be rendered', () => {
    it('when loading', () => {
      render(
        <TestComponent>
          <PreviewAvatar
            initials="AZ"
            username="Apple Zebra"
            isVideoEnabled={false}
            isVideoLoading
          />
        </TestComponent>
      );

      expect(screen.getByTestId('TestComponent')).toBeEmptyDOMElement();
    });

    it('when publishing video is enabled', () => {
      render(
        <TestComponent>
          <PreviewAvatar
            initials="AZ"
            username="Apple Zebra"
            isVideoEnabled
            isVideoLoading={false}
          />
        </TestComponent>
      );

      expect(screen.getByTestId('TestComponent')).toBeEmptyDOMElement();
    });
  });
});
