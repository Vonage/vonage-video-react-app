import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FlexLayout from './index';

describe('FlexLayout', () => {
  it('renders with compound components', () => {
    render(
      <FlexLayout>
        <FlexLayout.Left>Left content</FlexLayout.Left>
        <FlexLayout.Right>Right content</FlexLayout.Right>
      </FlexLayout>
    );

    expect(screen.getByText('Left content')).toBeInTheDocument();
    expect(screen.getByText('Right content')).toBeInTheDocument();
  });

  it('renders left content only', () => {
    render(
      <FlexLayout>
        <FlexLayout.Left>Only left content</FlexLayout.Left>
      </FlexLayout>
    );

    expect(screen.getByText('Only left content')).toBeInTheDocument();
    expect(screen.queryByText('Right content')).not.toBeInTheDocument();
  });

  it('renders right content only', () => {
    render(
      <FlexLayout>
        <FlexLayout.Right>Only right content</FlexLayout.Right>
      </FlexLayout>
    );

    expect(screen.getByText('Only right content')).toBeInTheDocument();
    expect(screen.queryByText('Left content')).not.toBeInTheDocument();
  });
});
