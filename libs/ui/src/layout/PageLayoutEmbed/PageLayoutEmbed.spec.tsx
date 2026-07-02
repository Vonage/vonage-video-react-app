import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PageLayoutEmbed from './index';

describe('PageLayoutEmbed', () => {
  it('renders with compound components', () => {
    render(
      <PageLayoutEmbed>
        <PageLayoutEmbed.Left>Left content</PageLayoutEmbed.Left>
        <PageLayoutEmbed.Right>Right content</PageLayoutEmbed.Right>
      </PageLayoutEmbed>
    );

    expect(screen.getByText('Left content')).toBeInTheDocument();
    expect(screen.getByText('Right content')).toBeInTheDocument();
  });

  it('renders left content only', () => {
    render(
      <PageLayoutEmbed>
        <PageLayoutEmbed.Left>Only left content</PageLayoutEmbed.Left>
      </PageLayoutEmbed>
    );

    expect(screen.getByText('Only left content')).toBeInTheDocument();
    expect(screen.queryByText('Right content')).not.toBeInTheDocument();
  });

  it('renders right content only', () => {
    render(
      <PageLayoutEmbed>
        <PageLayoutEmbed.Right>Only right content</PageLayoutEmbed.Right>
      </PageLayoutEmbed>
    );

    expect(screen.getByText('Only right content')).toBeInTheDocument();
    expect(screen.queryByText('Left content')).not.toBeInTheDocument();
  });
});
