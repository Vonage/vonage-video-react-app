import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PageLayout from './index';

describe('PageLayout', () => {
  it('renders with compound components', () => {
    render(
      <PageLayout>
        <PageLayout.Left>Left content</PageLayout.Left>
        <PageLayout.Right>Right content</PageLayout.Right>
      </PageLayout>
    );

    expect(screen.getByText('Left content')).toBeInTheDocument();
    expect(screen.getByText('Right content')).toBeInTheDocument();
  });

  it('renders left content only', () => {
    render(
      <PageLayout>
        <PageLayout.Left>Only left content</PageLayout.Left>
      </PageLayout>
    );

    expect(screen.getByText('Only left content')).toBeInTheDocument();
    expect(screen.queryByText('Right content')).not.toBeInTheDocument();
  });

  it('renders right content only', () => {
    render(
      <PageLayout>
        <PageLayout.Right>Only right content</PageLayout.Right>
      </PageLayout>
    );

    expect(screen.getByText('Only right content')).toBeInTheDocument();
    expect(screen.queryByText('Left content')).not.toBeInTheDocument();
  });
});
